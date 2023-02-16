export const getMoment = () => {
  const timestamp = new Date();
  const date = timestamp.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const time = timestamp.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });
  return { date, time };
};
