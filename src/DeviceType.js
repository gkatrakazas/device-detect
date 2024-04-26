import React, { useState, useEffect } from 'react';
import { isMobile, isTablet, browserName } from 'react-device-detect';

const DeviceType = () => {
  const [deviceType, setDeviceType] = useState("Desktop 🖥️");
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [browser, setBrowser] = useState(browserName); // Detecting the browser

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    if (isMobile) {
      setDeviceType("Mobile 📱");
    } else if (isTablet) {
      setDeviceType("Tablet 📲");
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone ||
                document.referrer.includes('android-app://');

  return (
    <div className="animated">
      <h1>Device and Mode Detection</h1>
      <p>The detected device type is: {deviceType}</p>
      <p>Screen Width: {width}px</p>
      <p>Screen Height: {height}px</p>
      <p>Browser: {browser}</p>
      <p>This is {isPWA ? '' : 'not '}a Progressive Web App.</p>
    </div>
  );
};

export default DeviceType;
