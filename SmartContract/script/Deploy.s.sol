// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {MedicalRecordRegistry} from "../src/MedicalRecordRegistry.sol";

contract DeployScript is Script {
    MedicalRecordRegistry public registry;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        registry = new MedicalRecordRegistry();

        vm.stopBroadcast();
    }
}
