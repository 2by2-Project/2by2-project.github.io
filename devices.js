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
    const devicesContainer = document.querySelector('#devices');
    const bannerDisplay = document.querySelector('#device_banner');
    const iconDisplay = document.querySelector('#device_icon');

    if (!devicesContainer) return;

    devices.forEach(device => {
        const deviceDownloadLinkLi = createDeviceListItem(device);
        devicesContainer.appendChild(deviceDownloadLinkLi);
    });

    displayDeviceBannerAndIcon(bannerDisplay, iconDisplay, devices[0]);
}

const createDeviceListItem = (device) => {
    const deviceDownloadLinkLi = document.createElement('li');
    const deviceDownloadLink = document.createElement('a');
    deviceDownloadLink.innerText = device.name;
    deviceDownloadLink.href = `./devices/${device.codename}`;

    const deviceDownloadCodename = document.createElement('code');
    deviceDownloadCodename.innerText = device.codename;
    deviceDownloadCodename.style.marginLeft = '32px';

    deviceDownloadLinkLi.append(deviceDownloadLink, deviceDownloadCodename);
    return deviceDownloadLinkLi;
}

const displayDeviceBannerAndIcon = (bannerDisplay, iconDisplay, device) => {
    if (bannerDisplay) {
        bannerDisplay.innerHTML = device.banner 
            ? `<img src="https://raw.githubusercontent.com/2by2-Project/2by2-project.github.io/main/banners/${device.codename}.png" alt="${device.name} banner">`
            : 'No banner available';
    }
    if (iconDisplay) {
        iconDisplay.innerHTML = device.icon 
            ? `<img src="${device.icon}" alt="${device.name} icon">`
            : 'No icon available';
    }
}

const initDownloadPage = async () => {
    const nameDisplay = document.querySelector('#device_name');
    const warningDisplay = document.querySelector('.warning');
    const codenameDisplay = document.querySelector('#device_codename');
    const maintainerDisplay = document.querySelector('#device_maintainer');
    const changeLogsDisplay = document.querySelector('#device_changelog');
    const downloadLink = document.querySelector('#device_download_link');
    const recoveryLinkContainer = document.querySelector('#device_recovery_links');
    const bannerDisplay = document.querySelector('#device_banner');
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
            warningDisplay,
            changeLogsDisplay,
            downloadLink,
            recoveryLinkContainer,
            device,
            otaDetails,
            changeLogs,
            bannerDisplay,
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
    warningDisplay, 
    changeLogsDisplay, 
    downloadLink, 
    recoveryLinkContainer, 
    device, 
    otaDetails, 
    changeLogs, 
    bannerDisplay, 
    iconDisplay 
}) => {
    nameDisplay.innerText = device.name;
    codenameDisplay.innerText = device.codename;
    maintainerDisplay.innerText = device.maintainer;

    if (device.copy_partitions) {
        warningDisplay.style.display = 'block';
        warningDisplay.innerHTML = `For first flashing, you need to flash copy-partitions.zip with OTA zips.`
                                    + `<a href="https://sourceforge.net/projects/project2by2-test/files/misc/copy_partitions/copy-partitions-20220613-signed.zip/download">Download is here</a>`;
    }

    changeLogsDisplay.innerText = changeLogs;

    downloadLink.innerText = otaDetails.filename;
    downloadLink.href = otaDetails.url;

    recoveryLinkContainer.innerHTML = device.recovery_images.map(partition => 
        `<a href="https://master.dl.sourceforge.net/project/project2by2-test/${device.codename}/${otaDetails.platform_version}/${partition}/${partition}.img?viasf=1">${partition}.img</a>`
    ).join(' , ');

    displayDeviceBannerAndIcon(bannerDisplay, iconDisplay, device);
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
