async function readDataStream() {
    const filters = [
        { usbVendorId: 0x067B, usbProductId: 0x23D3 }, 
    ];
    
    try {
        navigator.serial.getPorts().then((portInfo) => {
            console.log('portInfo: ', portInfo);
        });
        const port = await navigator.serial.requestPort({ filters });
        const portInfo = port.getInfo();
        console.log('portInfo info: ', portInfo);
        document.getElementById('device-name').innerText = `vendorId: ${portInfo.usbVendorId} | productId: ${portInfo.usbProductId}`;
        await port.open({ baudRate: 115200 });
        await readData(port);
    } catch (error) {
        if (error.name === 'NotFoundError') {
            document.getElementById('device-name').innerText = 'No device found';
        } else {
            document.getElementById('device-name').innerText = 'Error: ' + error;
        }
        console.error('Error: ', error.name, error.message, error.stack);
    }

}

// async function readDataStream() {
//     try {
//         const port = await navigator.serial.requestPort();
//         console.log('port: ', port);
//         await port.open({ baudRate: 115200 });
//         const { usbVendorId, usbProductId } = port.getInfo();
//         console.log('usbVendorId: ', usbVendorId, 'usbProductId: ', usbProductId);
//         await readData(port);
//     } catch (error) {  
//         console.log("Error: Open");
//         console.log(error);
//     }
//     // const port = await navigator.serial.requestPort();
//     // console.log('port: ', port);
//     // await port.open({ 
//     //     baudRate: 115200,
//     //     dataBits: 8,
//     //     stopBits: 1,
//     //     parity: "none",
//     //     flowControl: "none",
//     // });
//     // const { usbVendorId, usbProductId } = port.getInfo();
//     // console.log('usbVendorId: ', usbVendorId, 'usbProductId: ', usbProductId);
//     // await readData(port);
// }

async function readData(port) {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            break;
        }
        // value is a string.
        console.log(value);
        let paragraph = document.getElementById('sensor-data');
        paragraph.innerText += value;  
    }
}

document.getElementById('clickme').addEventListener('click', readDataStream);
