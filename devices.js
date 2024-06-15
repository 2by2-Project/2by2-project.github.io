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
        deviceDownloadLink.innerText = devices[i].name;
        deviceDownloadLink.href = `./download.htm?device=${devices[i].codename}`;

        var deviceDownloadCodename = document.createElement('code');
        deviceDownloadCodename.innerText = devices[i].codename;
        deviceDownloadCodename.style.marginLeft = '32px';
        
        deviceDownloadLinkLi.appendChild(deviceDownloadLink);
        deviceDownloadLinkLi.appendChild(deviceDownloadCodename);
        
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
    const targetDevice = params.get('device');
    const device = devices.find((device) => device.codename === targetDevice);
    if (!device) {
        nameDisplay.innerText = 'Error: No such device found: ' + targetDevice;
        return;
    }

    const otaDetails = await getOtaDetails(device.codename);

    nameDisplay.innerText = device.name;
    codenameDisplay.innerText = device.codename;

    downloadLink.innerText = otaDetails.filename;
    downloadLink.href = otaDetails.url;

    device.recovery_images.forEach((partition) => {
        var recoveryLink = document.createElement('a');
        recoveryLink.innerText = `${partition}.img`;
        recoveryLink.href = `https://master.dl.sourceforge.net/project/project2by2-test/${device.codename}/${otaDetails.platform_version}/${partition}/${partition}.img?viasf=1`;
        recoveryLinkContainer.appendChild(recoveryLink);
        recoveryLinkContainer.appendChild(document.createElement('br'));
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
