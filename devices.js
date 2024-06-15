let devices = null;

window.onload = async () => {
    devices = await getDevices();

    // Run init script
    if (location.href.includes('devices.htm')) initDevicesPage();
    if (location.href.includes('download.htm')) initDownloadPage();
}

const initDevicesPage = async () => {
    const devicesContainer = document.querySelector('#devices');
    if (!devicesContainer) return;

    for (let i = 0; i < devices.length; i++) {
        var deviceDownloadLinkLi = document.createElement('li');
    
        var deviceDownloadLink = document.createElement('a');
        deviceDownloadLink.innerText = `${devices[i].name} - ${devices[i].codename}`;
        deviceDownloadLink.href = `./download.htm?device_id=${i}`;
        
        deviceDownloadLinkLi.appendChild(deviceDownloadLink);
        
        devicesContainer.appendChild(deviceDownloadLinkLi);
    }
}

const initDownloadPage = async () => {
    const nameDisplay = document.querySelector('#device_name');
    const codenameDisplay = document.querySelector('#device_codename');
    const downloadLink = document.querySelector('#device_download_link');
    const recoveryLinkContainer = document.querySelector('#device_recovery_links');
    if (!codenameDisplay || !downloadLink || !recoveryLinkContainer) return;

    const params = new URLSearchParams(window.location.search);
    const deviceId = params.get('device_id');

    const otaDetails = await getOtaDetails(devices[deviceId].codename);

    nameDisplay.innerText = devices[deviceId].name;
    codenameDisplay.innerText = devices[deviceId].codename;

    downloadLink.innerText = otaDetails.filename;
    downloadLink.href = otaDetails.url;

    devices[deviceId].recovery_images.forEach((partition) => {
        var recoveryLink = document.createElement('a');
        recoveryLink.innerText = `${partition}.img`;
        recoveryLink.href = `https://master.dl.sourceforge.net/project/project2by2-test/${devices[deviceId].codename}/${otaDetails.version}/${partition}/${partition}.img?viasf=1`;
        recoveryLink.style.marginRight = '12px';
        recoveryLinkContainer.appendChild(recoveryLink);
    });
}

const getDevices = async () => {
    const devicesJsonUrl = 'https://raw.githubusercontent.com/2by2-Project/android_vendor_2by2-ota/main/devices.json';
    const fetchData = await fetch(devicesJsonUrl);
    const jsonData = await fetchData.json();
    return jsonData.devices;
}

const getOtaDetails = async (codename) => {
    const devicesJsonUrl = `https://raw.githubusercontent.com/2by2-Project/android_vendor_2by2-ota/main/builds/${codename}.json`;
    const fetchData = await fetch(devicesJsonUrl);
    const jsonData = await fetchData.json();
    return jsonData.response[0];
}
