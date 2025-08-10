
'use client';
import { useState, useCallback } from 'react';

// Standard Bluetooth GATT Service UUID for Heart Rate
const HEART_RATE_SERVICE_UUID = 'heart_rate';
// Standard Bluetooth GATT Characteristic UUID for Heart Rate Measurement
const HEART_RATE_CHARACTERISTIC_UUID = 'heart_rate_measurement';

export function useBluetoothHR() {
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleCharacteristicValueChanged = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (value) {
      const newHeartRate = parseHeartRate(value);
      setHeartRate(newHeartRate);
    }
  };
  
  const parseHeartRate = (value: DataView): number => {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    let heartRateValue: number;
    if (rate16Bits) {
      heartRateValue = value.getUint16(1, true);
    } else {
      heartRateValue = value.getUint8(1);
    }
    return heartRateValue;
  };

  const requestDevice = useCallback(async () => {
    try {
      if (!navigator.bluetooth) {
        alert('Web Bluetooth API is not available in this browser.');
        return;
      }

      console.log('Requesting Bluetooth device...');
      const newDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE_UUID] }],
        optionalServices: [HEART_RATE_SERVICE_UUID]
      });
      
      console.log('Device found:', newDevice.name);
      setDevice(newDevice);

      newDevice.addEventListener('gattserverdisconnected', onDisconnected);

      console.log('Connecting to GATT Server...');
      const newServer = await newDevice.gatt?.connect();
      if (!newServer) {
        console.error('Could not connect to GATT Server');
        return;
      }
      setServer(newServer);
      
      console.log('Getting Heart Rate Service...');
      const service = await newServer.getPrimaryService(HEART_RATE_SERVICE_UUID);
      
      console.log('Getting Heart Rate Measurement Characteristic...');
      const newCharacteristic = await service.getCharacteristic(HEART_RATE_CHARACTERISTIC_UUID);
      
      await newCharacteristic.startNotifications();
      console.log('> Notifications started');

      newCharacteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      setCharacteristic(newCharacteristic);

      setIsConnected(true);

    } catch (error) {
      console.error('Error connecting to Bluetooth device:', error);
      setIsConnected(false);
    }
  }, []);

  const onDisconnected = () => {
      console.log('Device disconnected');
      setIsConnected(false);
      setHeartRate(null);
      setDevice(null);
      setServer(null);
      if (characteristic) {
        characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        setCharacteristic(null);
      }
  }


  const disconnectDevice = useCallback(async () => {
    if (device && server?.connected) {
      console.log('Disconnecting from device...');
      await characteristic?.stopNotifications();
      server.disconnect();
      onDisconnected();
    }
  }, [device, server, characteristic]);

  return { heartRate, isConnected, requestDevice, disconnectDevice };
}

    