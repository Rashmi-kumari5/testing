import { describe, expect, it } from "vitest";

import { extractRawTasks, normalizeAsamaTask } from "./asama";

describe("extractRawTasks", () => {
  it("returns the root array when payload is already an array", () => {
    const raw = [{ id: 1 }];
    expect(extractRawTasks(raw)).toEqual(raw);
  });

  it("prefers the canonical `tasks` field when multiple arrays are present", () => {
    const payload = { data: [{ id: "abc" }], tasks: [{ id: "should-not-be-used" }] };
    expect(extractRawTasks(payload)).toEqual(payload.tasks);
  });

  it("returns an empty array when the payload structure is unknown", () => {
    expect(extractRawTasks({})).toEqual([]);
  });
});

describe("normalizeAsamaTask", () => {
  it("maps alternative property names and normalizes values", () => {
    const task = normalizeAsamaTask(
      {
        taskId: "NTS-42",
        name: "Ship secure webhook proxy",
        details: "Harden retries, document rollout.",
        state: "In Progress",
        severity: "P1",
        owner: {
          firstName: "Leah",
          lastName: "Irving",
        },
        due_date: "2025-11-19",
        labels: ["security", "release"],
        metrics: {
          openFindings: 3,
          note: "Tag v2.4",
          skip: { nested: true },
        },
      },
      "NTS",
    );

    expect(task).toMatchObject({
      id: "NTS-42",
      title: "Ship secure webhook proxy",
      description: "Harden retries, document rollout.",
      status: "In Progress",
      priority: "high",
      assignee: "Leah Irving",
      dueDate: "2025-11-19T00:00:00.000Z",
      tags: ["security", "release"],
      metrics: {
        openFindings: 3,
        note: "Tag v2.4",
      },
    });
  });

  it("falls back to sensible defaults when fields are missing", () => {
    const task = normalizeAsamaTask({}, "NTS");
    expect(task.id).toContain("NTS-");
    expect(task.title).toBe("Untitled task");
    expect(task.priority).toBe("unknown");
    expect(task.tags).toEqual([]);
  });
});
