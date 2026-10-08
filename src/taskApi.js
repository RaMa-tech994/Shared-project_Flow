const TASKS_URL = "https://testapi.io/api/RaMa-tech994/resource/Tasklist";
const TASKS_LIST_URL = "https://testapi.io/api/RaMa-tech994/resource/tasklist";

function normalizeTask(task) {
  const record = task.data ?? task;

  return {
    id: record.id,
    title: record.Title ?? record.title,
    status: record.Status ?? record.status,
    deadline: record.Deadline ?? record.deadline,
  };
}

async function readResponse(response) {
  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    const details = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error(
      `Serveris atmetė užklausą (HTTP ${response.status}).${details ? ` ${details}` : ""}`,
    );
  }

  return data;
}

export async function getTasks() {
  const response = await fetch(TASKS_LIST_URL);
  const data = await readResponse(response);
  const tasks = Array.isArray(data) ? data : data?.data;

  if (!Array.isArray(tasks)) {
    throw new Error("Serveris grąžino netinkamą užduočių sąrašą.");
  }

  return tasks.map(normalizeTask);
}

export async function createTask(task) {
  const response = await fetch(TASKS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Title: task.title, Status: task.status, Deadline: task.deadline }),
  });

  const data = await readResponse(response);

  if (data && typeof data === "object") {
    return normalizeTask(data);
  }

  return { ...task, id: `saved-${Date.now()}` };
}
