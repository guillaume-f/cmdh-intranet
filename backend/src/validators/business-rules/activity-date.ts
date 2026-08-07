export const activityDateValidator = (activityDate: Date): boolean => {
  if (Number.isNaN(activityDate.getTime())) {
    return false;
  }

  if (activityDate.getTime() <= Date.now()) {
    return false;
  }

  return true;
};
