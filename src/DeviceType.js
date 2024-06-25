import React, { useState, useEffect } from 'react';
import { isMobile, browserName, osName, isDesktop } from 'react-device-detect';

const DeviceType = () => {
    const [deviceType, setDeviceType] = useState(isMobile ? "Mobile 📱" : isDesktop ? "Desktop 🖥️" : "Unknown Device");
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    const [browser] = useState(browserName); // Detecting the browser
    const [os] = useState(osName); // Operating system name
    const [hasBackCamera, setHasBackCamera] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [bestFrontCamera, setBestFrontCamera] = useState(null);
    const [bestBackCamera, setBestBackCamera] = useState(null);
    const [mediaDevices, setMediaDevices] = useState([]);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');

    const handleResize = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const checkCamera = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                console.log('mediaDevices: ', devices);
                setMediaDevices(devices);

                const videoDevices = devices.filter(({ kind }) => kind === "videoinput");

                let bestFrontCamera = null;
                let bestBackCamera = null;

                for (const device of videoDevices) {
                    console.log(device);
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: device.deviceId } });
                    const track = stream.getVideoTracks()[0];
                    const capabilities = track.getCapabilities();
                    console.log(capabilities);
                    const isBackCamera = device.label.toLowerCase().includes('back');
                    const resolution = {
                        width: capabilities.width?.max || 0,
                        height: capabilities.height?.max || 0
                    };

                    if (isBackCamera && (!bestBackCamera || bestBackCamera.resolution.width * bestBackCamera.resolution.height < resolution.width * resolution.height)) {
                        bestBackCamera = { device, resolution };
                    } else if (!isBackCamera && (!bestFrontCamera || bestFrontCamera.resolution.width * bestFrontCamera.resolution.height < resolution.width * resolution.height)) {
                        bestFrontCamera = { device, resolution };
                    }

                    track.stop();
                }

                setHasBackCamera(!!bestBackCamera);
                setBestFrontCamera(bestFrontCamera);
                setBestBackCamera(bestBackCamera);
                setCameras(videoDevices);

                // Update media devices after getting permission
                const updatedDevices = await navigator.mediaDevices.enumerateDevices();
                setMediaDevices(updatedDevices);

            } catch (error) {
                console.error("Error accessing media devices.", error);
            }
        };

        checkCamera();
    }, []);

    const generateCameraInfo = () => {
        let cameraInfo = '';
        cameras.forEach((camera, index) => {
            cameraInfo += `Camera ${index + 1}:\n`;
            cameraInfo += `Label: ${camera.label}\n`;
            cameraInfo += `Device ID: ${camera.deviceId}\n`;
            cameraInfo += `Kind: ${camera.kind}\n\n`;
        });

        if (bestFrontCamera) {
            cameraInfo += `Best Front Camera:\n`;
            cameraInfo += `Label: ${bestFrontCamera.device.label}\n`;
            cameraInfo += `Device ID: ${bestFrontCamera.device.deviceId}\n`;
            cameraInfo += `Resolution: ${bestFrontCamera.resolution.width}x${bestFrontCamera.resolution.height}\n\n`;
        }

        if (bestBackCamera) {
            cameraInfo += `Best Back Camera:\n`;
            cameraInfo += `Label: ${bestBackCamera.device.label}\n`;
            cameraInfo += `Device ID: ${bestBackCamera.device.deviceId}\n`;
            cameraInfo += `Resolution: ${bestBackCamera.resolution.width}x${bestBackCamera.resolution.height}\n\n`;
        }

        return cameraInfo;
    };

    const generateMediaDevicesInfo = () => {
        let devicesInfo = '';
        mediaDevices.forEach((device, index) => {
            devicesInfo += `Device ${index + 1}:\n`;
            devicesInfo += `Label: ${device.label}\n`;
            devicesInfo += `Device ID: ${device.deviceId}\n`;
            devicesInfo += `Kind: ${device.kind}\n\n`;
        });
        return devicesInfo;
    };

    return (
        <div className="animated">
            <h1>Device and Mode Detection</h1>
            <p>The detected device type is: {deviceType}</p>
            <p>Screen Width: {width}px</p>
            <p>Screen Height: {height}px</p>
            <p>Browser: {browser}</p>
            <p>Operating System: {os}</p>
            <p>Back Camera Available: {hasBackCamera ? 'Yes' : 'No'}</p>
            <p>This is {isPWA ? '' : 'not '}a Progressive Web App.</p>
            <h2>Media Devices Information</h2>
            {mediaDevices.length > 0 ? (
                <textarea
                    style={{ width: '100%', height: '200px' }}
                    readOnly
                    value={generateMediaDevicesInfo()}
                />
            ) : (
                <p>No media devices found</p>
            )}
            {/* <h2>Camera Devices Information</h2>
            {cameras.length > 0 ? (
                <textarea
                    style={{ width: '100%', height: '300px' }}
                    readOnly
                    value={generateCameraInfo()}
                />
            ) : (
                <p>No camera devices found</p>
            )} */}
        </div>
    );
};

export default DeviceType;
