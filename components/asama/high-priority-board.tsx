import type { AsamaFetchResult, AsamaTask } from "@/lib/asama";

type HighPriorityBoardProps = {
  data: AsamaFetchResult;
};

/**
 * Renders the Asama high-priority swimlane with helpful context at the top.
 */
export function HighPriorityBoard({ data }: HighPriorityBoardProps) {
  const [nextDue] = data.tasks;

  return (
    <section className="w-full space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-500">
            Board · {data.boardId}
          </p>
          <h1 className="text-3xl font-semibold text-zinc-950">
            {data.boardName ?? "Asama Board"} · High Priority
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span
            className={`rounded-full border px-3 py-1 font-medium ${
              data.source === "remote"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {data.source === "remote" ? "Live API" : "Snapshot"}
          </span>
          <span className="text-zinc-500">
            Updated {formatRelative(data.updatedAt ?? data.fetchedAt)}
          </span>
        </div>
      </header>

      {nextDue && (
        <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 sm:grid-cols-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-500">
              Top focus
            </p>
            <p className="text-lg font-semibold text-zinc-900">{nextDue.title}</p>
            <p className="text-sm text-zinc-600">
              Due {formatShortDate(nextDue.dueDate)} · {nextDue.assignee ?? "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-500">Workload</p>
            <p className="text-4xl font-semibold text-zinc-900">{data.tasks.length}</p>
            <p className="text-sm text-zinc-600">high-priority tasks</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-500">In motion</p>
            <p className="text-4xl font-semibold text-zinc-900">
              {countByStatus(data.tasks, ["in-progress", "in progress", "in_progress"])}
            </p>
            <p className="text-sm text-zinc-600">actively being worked</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {data.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

type TaskCardProps = {
  task: AsamaTask;
};

function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/60 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {task.id}
          </p>
          <h2 className="text-2xl font-semibold text-zinc-950">{task.title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{task.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-medium">
          {task.status && <Pill label={task.status} kind="status" />}
          <Pill label={task.priority} kind="priority" />
          <Pill label={task.assignee ?? "Unassigned"} />
          {task.dueDate && <Pill label={`Due ${formatShortDate(task.dueDate)}`} kind="due" />}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {task.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600"
          >
            {tag}
          </span>
        ))}
      </div>

      {task.metrics && Object.keys(task.metrics).length > 0 && (
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          {Object.entries(task.metrics).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
              <dt className="text-xs uppercase tracking-wide text-zinc-500">{key}</dt>
              <dd className="text-lg font-semibold text-zinc-900">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}

type PillProps = {
  label: string;
  kind?: "status" | "priority" | "due";
};

function Pill({ label, kind }: PillProps) {
  if (kind === "priority") {
    return (
      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs uppercase tracking-wide text-rose-700">
        {label}
      </span>
    );
  }

  if (kind === "status") {
    return (
      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs uppercase tracking-wide text-indigo-700">
        {label}
      </span>
    );
  }

  if (kind === "due") {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        {label}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
      {label}
    </span>
  );
}

function countByStatus(tasks: AsamaTask[], statuses: string[]) {
  const normalized = statuses.map((status) => status.toLowerCase());
  return tasks.filter((task) => task.status && normalized.includes(task.status.toLowerCase()))
    .length;
}

function formatShortDate(value?: string) {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatRelative(value?: string) {
  if (!value) return "just now";
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const then = new Date(value).getTime();
  const now = Date.now();
  const diffMinutes = Math.round((then - now) / (1000 * 60));

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}
