export const getWorkCounts = (work) => {
    const inititalCounts = () => ({
        total: 0,
        completed: 0,
        in_progress: 0,
        untouched: 0,
    });
    const summary = {
        work: inititalCounts(),
        feature: inititalCounts(),
        bug: inititalCounts(),
        task: inititalCounts(),
    };
    for (const w of work) {
        const type = ['task', 'feature', 'bug'].includes(w.type) ? w.type : 'task';
        const status = ['completed', 'in_progress', 'untouched'].includes(w.status) ? w.status : 'untouched';
        summary[type].total += 1;
        summary.work.total += 1;
        if (status === 'completed') {
            summary[type].completed += 1;
            summary.work.completed += 1;
        }
        else if (status === 'in_progress') {
            summary[type].in_progress += 1;
            summary.work.in_progress += 1;
        }
        else {
            summary[type].untouched += 1;
            summary.work.untouched += 1;
        }
    }
    const response = {
        total_work_count: summary.work.total,
        completed_work_count: summary.work.completed,
        inprogress_work_count: summary.work.in_progress,
        untouched_work_count: summary.work.untouched,
        total_task_count: summary.task.total,
        completed_task_count: summary.task.completed,
        inprogress_task_count: summary.task.in_progress,
        untouched_task_count: summary.task.untouched,
        total_feature_count: summary.feature.total,
        completed_feature_count: summary.feature.completed,
        inprogress_feature_count: summary.feature.in_progress,
        untouched_feature_count: summary.feature.untouched,
        total_bug_count: summary.bug.total,
        completed_bug_count: summary.bug.completed,
        inprogress_bug_count: summary.bug.in_progress,
        untouched_bug_count: summary.bug.untouched,
    };
    return response;
};
export const getFilter = (message) => {
    // Example message: "feat: solve the issue 10 completed"
    const parts = message.trim().split(':');
    if (parts.length < 2)
        return null;
    const type = parts[0].trim().toLowerCase(); // e.g. feat | fix | task
    const details = parts[1].trim().toLowerCase(); // e.g. "solve the issue 10 completed"
    // Extract first number (work ID)
    const idMatch = details.match(/\b\d+\b/);
    const id = idMatch ? parseInt(idMatch[0]) : null;
    // Extract status keyword
    const statusMatch = details.match(/\b(completed|done|in\s*progress|progress)\b/);
    const statusRaw = statusMatch ? statusMatch[0].toLowerCase() : null;
    if (!id || isNaN(id))
        return null;
    // Map commit type
    let workType = '';
    switch (type) {
        case 'task':
            workType = 'task';
            break;
        case 'feat':
            workType = 'feature';
            break;
        case 'fix':
            workType = 'bug';
            break;
        default:
            return null;
    }
    // Normalize status
    let workStatus = '';
    if (statusRaw === 'completed' || statusRaw === 'done')
        workStatus = 'completed';
    else if (statusRaw && statusRaw.includes('progress'))
        workStatus = 'in_progress';
    else
        workStatus = 'todo';
    return {
        id,
        type: workType,
        status: workStatus,
    };
};
