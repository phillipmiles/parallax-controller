export const convertPercentToPixel = (value, relativeTo) => {
  return Math.round((parseFloat(value) / 100) * relativeTo);
};
