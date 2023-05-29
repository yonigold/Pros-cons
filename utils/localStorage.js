export const getSubmissionCount = () => {
    const count = localStorage.getItem('submissionCount');
    return count ? parseInt(count) : 0;
}

export const incrementSubmissionCount = () => {
    const count = getSubmissionCount() + 1;
    localStorage.setItem('submissionCount', count.toString());
}