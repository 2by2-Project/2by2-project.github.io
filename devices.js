let devices = [];

window.onload = async () => {
    try {
        devices = await getDevices();
        const path = location.href;

        if (path.includes('devices.htm')) {
            await initDevicesPage();
        } else if (path.includes('download.htm')) {
            await initDownloadPage();
        }
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
}

const initDevicesPage = async () => {
    const devicesContainer = document.querySelector('.devices-container');

    if (!devicesContainer) return;

    devices.forEach(device => {
        const deviceDownloadLinkLi = createDeviceListItem(device);
        devicesContainer.appendChild(deviceDownloadLinkLi);
    });
}

const createDeviceListItem = (device) => {
    const deviceDownloadLinkTr = document.createElement('tr');
    deviceDownloadLinkTr.classList.add('device-link', 'gradient-banner');

    const deviceDownloadLink = document.createElement('a');
    deviceDownloadLink.innerText = device.name;
    deviceDownloadLink.href = `./download.htm?device=${device.codename}`;

    const deviceDownloadCodename = document.createElement('span');
    deviceDownloadCodename.innerText = device.codename;

    deviceDownloadLinkTr.append(deviceDownloadLink, deviceDownloadCodename);
    return deviceDownloadLinkTr;
}

const initDownloadPage = async () => {
    const nameDisplay = document.querySelector('#device_name');
    const warningCopyPartitionsDisplay = document.querySelector('.warning-copy-partitions');
    const codenameDisplay = document.querySelector('#device_codename');
    const maintainerDisplay = document.querySelector('#device_maintainer');
    const changeLogsDisplay = document.querySelector('#device_changelog');
    const downloadLink = document.querySelector('#device_download_link');
    const recoveryLinkContainer = document.querySelector('#device_recovery_links');
    const iconDisplay = document.querySelector('#device_icon');

    if (!codenameDisplay || !downloadLink || !recoveryLinkContainer) return;

    const targetDevice = new URLSearchParams(window.location.search).get('device');
    const device = devices.find(d => d.codename === targetDevice);

    if (!device) {
        nameDisplay.innerText = `Error: No such device found: ${targetDevice}`;
        return;
    }

    try {
        const [otaDetails, changeLogs] = await Promise.all([
            getOtaDetails(device.codename),
            fetch(`https://raw.githubusercontent.com/2by2-Project/android_vendor_2by2-ota/main/changelogs/${device.codename}.txt`).then(response => response.text())
        ]);

        updateDownloadPageContent({
            nameDisplay,
            codenameDisplay,
            maintainerDisplay,
            warningCopyPartitionsDisplay,
            changeLogsDisplay,
            downloadLink,
            recoveryLinkContainer,
            device,
            otaDetails,
            changeLogs,
            iconDisplay
        });
    } catch (error) {
        console.error('Failed to initialize download page:', error);
    }
}

const updateDownloadPageContent = ({ 
    nameDisplay, 
    codenameDisplay, 
    maintainerDisplay, 
    warningCopyPartitionsDisplay, 
    changeLogsDisplay, 
    downloadLink, 
    recoveryLinkContainer, 
    device, 
    otaDetails, 
    changeLogs, 
    iconDisplay
}) => {
    nameDisplay.innerText = device.name;
    codenameDisplay.innerText = device.codename;
    maintainerDisplay.innerText = device.maintainer;
    iconDisplay.src = 'assets/device/icon/' + device.codename + '.png';

    if (device.copy_partitions) warningCopyPartitionsDisplay.style.display = 'block';

    changeLogsDisplay.innerText = changeLogs;

    downloadLink.innerText = otaDetails.filename;
    downloadLink.href = otaDetails.url;

    recoveryLinkContainer.innerHTML = device.recovery_images.map(partition => 
        `<a href="https://master.dl.sourceforge.net/project/project2by2-test/${device.codename}/${otaDetails.platform_version}/${partition}/${partition}.img?viasf=1">${partition}.img</a>`
    ).join('<br>');
}

const getDevices = async () => {
    const response = await fetch('https://raw.githubusercontent.com/2by2-Project/android_vendor_2by2-ota/main/devices.json');
    const data = await response.json();
    return data.devices;
}

const getOtaDetails = async (codename) => {
    const response = await fetch(`https://raw.githubusercontent.com/2by2-Project/android_vendor_2by2-ota/main/builds/${codename}.json`);
    const data = await response.json();
    return data.response[0];
}
