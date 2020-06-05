export const update = async (apiUrl, channelId) => {
  const url = `${apiUrl}/channels/${channelId}/schedule}`;
  const response = await fetch(url);
  const schedule = await response.json();
  return schedule || [];
};
