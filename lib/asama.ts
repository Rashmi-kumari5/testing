import boardSnapshot from "@/data/asama/nts-board.json";

/**
 * Canonical representation for an Asama board task after normalization.
 */
export interface AsamaTask {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority: string;
  assignee?: string;
  team?: string;
  dueDate?: string;
  tags: string[];
  metrics?: Record<string, string | number>;
}

/**
 * Wrapper around the fetch result so the UI knows where the data came from.
 */
export interface AsamaFetchResult {
  boardId: string;
  boardName?: string;
  updatedAt?: string;
  tasks: AsamaTask[];
  fetchedAt: string;
  source: "remote" | "fallback";
}

type RawTask = Record<string, unknown>;

const FALLBACK_BOARD_ID = boardSnapshot.board ?? "NTS";
const FALLBACK_BOARD_NAME = boardSnapshot.boardName ?? "Asama Board";

/**
 * Calls the remote Asama API (if configured) and returns every high priority task on the NTS board.
 * Falls back to the checked-in snapshot so that the UI remains useful offline and during local development.
 */
export async function fetchAsamaHighPriorityTasks(): Promise<AsamaFetchResult> {
  const boardId = process.env.ASAMA_BOARD_ID ?? FALLBACK_BOARD_ID;
  const baseUrl = process.env.ASAMA_API_BASE_URL;

  if (!baseUrl) {
    return buildFallbackResult();
  }

  const requestUrl = buildBoardUrl(baseUrl, boardId);
  requestUrl.searchParams.set("priority", "high");

  try {
    const response = await fetch(requestUrl, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Asama API responded with ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    const rawTasks = extractRawTasks(payload);
    const boardName = readBoardName(payload) ?? FALLBACK_BOARD_NAME;
    const normalizedTasks = rawTasks
      .map((task) => normalizeAsamaTask(task, boardId))
      .filter((task) => task.priority === "high");

    if (!normalizedTasks.length) {
      throw new Error("Asama API returned 0 high priority tasks");
    }

    return {
      boardId,
      boardName,
      updatedAt: readUpdatedAt(payload) ?? new Date().toISOString(),
      tasks: sortTasks(normalizedTasks),
      fetchedAt: new Date().toISOString(),
      source: "remote",
    };
  } catch (error) {
    console.error("[asama] falling back to snapshot", error);
    return buildFallbackResult();
  }
}

/**
 * Normalizes a single raw task object returned by the upstream API.
 */
export function normalizeAsamaTask(rawTask: RawTask, boardId: string): AsamaTask {
  const tags = readStringArray(rawTask.tags ?? rawTask.labels ?? rawTask.tagList);
  const priority = readPriority(rawTask.priority ?? rawTask.severity ?? rawTask.urgency);

  return {
    id: readString(rawTask.id ?? rawTask.taskId ?? rawTask.key) ?? `${boardId}-unknown`,
    title: readString(rawTask.title ?? rawTask.name ?? rawTask.summary) ?? "Untitled task",
    description: readString(rawTask.description ?? rawTask.details ?? rawTask.body),
    status: readString(rawTask.status ?? rawTask.state ?? rawTask.phase),
    priority,
    assignee: readAssignee(rawTask),
    team: readString(rawTask.team ?? rawTask.group ?? rawTask.pod),
    dueDate:
      readIsoDate(rawTask.dueDate ?? rawTask.due_date ?? rawTask.deadline ?? rawTask.targetDate) ??
      undefined,
    tags,
    metrics: readMetrics(rawTask.metrics ?? rawTask.meta),
  };
}

/**
 * Extracts the array of tasks from the various payload shapes used by the service.
 */
export function extractRawTasks(payload: unknown): RawTask[] {
  if (Array.isArray(payload)) {
    return payload as RawTask[];
  }

  if (payload && typeof payload === "object") {
    const candidateKeys = ["tasks", "data", "items", "records"];
    for (const key of candidateKeys) {
      const value = (payload as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        return value as RawTask[];
      }
    }
  }

  return [];
}

function buildBoardUrl(baseUrl: string, boardId: string): URL {
  const normalizedBase = baseUrl.endsWith("/")
    ? baseUrl.slice(0, baseUrl.length - 1)
    : baseUrl;
  return new URL(`${normalizedBase}/boards/${boardId}/tasks`);
}

function buildFallbackResult(): AsamaFetchResult {
  const normalizedTasks = (boardSnapshot.tasks ?? []).map((task) =>
    normalizeAsamaTask(task as RawTask, FALLBACK_BOARD_ID),
  );

  return {
    boardId: FALLBACK_BOARD_ID,
    boardName: FALLBACK_BOARD_NAME,
    updatedAt: boardSnapshot.updatedAt,
    tasks: sortTasks(normalizedTasks),
    fetchedAt: new Date().toISOString(),
    source: "fallback",
  };
}

function sortTasks(tasks: AsamaTask[]): AsamaTask[] {
  return tasks.toSorted((a, b) => {
    const aDue = a.dueDate ?? "";
    const bDue = b.dueDate ?? "";

    if (aDue && bDue) {
      return aDue.localeCompare(bDue);
    }

    if (aDue) return -1;
    if (bDue) return 1;

    return a.title.localeCompare(b.title);
  });
}

function readBoardName(payload: unknown): string | undefined {
  if (payload && typeof payload === "object") {
    return readString(
      (payload as Record<string, unknown>).boardName ??
        (payload as Record<string, unknown>).name,
    );
  }
  return undefined;
}

function readUpdatedAt(payload: unknown): string | undefined {
  if (payload && typeof payload === "object") {
    return readIsoDate(
      (payload as Record<string, unknown>).updatedAt ??
        (payload as Record<string, unknown>).refreshedAt,
    );
  }
  return undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function readIsoDate(value: unknown): string | undefined {
  const candidate = readString(value);
  if (!candidate) return undefined;
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => readString(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function readPriority(value: unknown): string {
  const normalized = readString(value)?.toLowerCase() ?? "unknown";
  if (["p0", "critical"].includes(normalized)) return "critical";
  if (["p1", "high"].includes(normalized)) return "high";
  if (["p2", "medium"].includes(normalized)) return "medium";
  if (["p3", "low"].includes(normalized)) return "low";
  return normalized;
}

function readAssignee(rawTask: RawTask): string | undefined {
  const assignee = rawTask.assignee ?? rawTask.owner ?? rawTask.pointPerson ?? rawTask.lead;
  if (typeof assignee === "string") {
    return readString(assignee);
  }

  if (assignee && typeof assignee === "object") {
    return readString(
      (assignee as Record<string, unknown>).name ??
        `${(assignee as Record<string, unknown>).firstName ?? ""} ${
          (assignee as Record<string, unknown>).lastName ?? ""
        }`,
    );
  }

  return undefined;
}

function readMetrics(value: unknown): Record<string, string | number> | undefined {
  if (!value || typeof value !== "object") return undefined;
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string | number>>(
    (acc, [key, metricValue]) => {
      if (typeof metricValue === "string" || typeof metricValue === "number") {
        acc[key] = metricValue;
      }
      return acc;
    },
    {},
  );
}
