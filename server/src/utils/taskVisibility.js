export function isTaskAdmin(user) {
  return user?.role === "Administrator";
}

export function taskAssigneeValues(user) {
  return [user?.name, user?.email].filter(Boolean);
}

export function taskVisibilityFilter(user) {
  if (isTaskAdmin(user)) {
    return {};
  }

  const values = taskAssigneeValues(user);
  if (!values.length) {
    return { assignee: "__NO_VISIBLE_TASKS__" };
  }

  return { assignee: { $in: values } };
}

export function canSeeTask(user, task) {
  if (!task) return false;
  if (isTaskAdmin(user)) return true;
  return taskAssigneeValues(user).includes(task.assignee);
}

export function filterVisibleTasks(user, tasks = []) {
  if (isTaskAdmin(user)) {
    return tasks;
  }

  const values = new Set(taskAssigneeValues(user));
  return tasks.filter((task) => values.has(task.assignee));
}
