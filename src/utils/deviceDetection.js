// utils/deviceDetection.js
export const getDeviceType = () => {
  const userAgent = navigator.userAgent;
  
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    return 'Mobile';
  }
  
  if (/Tablet|iPad|PlayBook|Silk|Kindle|Nexus 7|Nexus 10|Xoom|SCH-I800/.test(userAgent)) {
    return 'Tablet';
  }
  
  return 'Desktop';
};