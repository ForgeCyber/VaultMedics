// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {MedicalRecordRegistry} from "../src/MedicalRecordRegistry.sol";
import {console} from "forge-std/console.sol";

contract DeployScript is Script {
    MedicalRecordRegistry public registry;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        registry = new MedicalRecordRegistry();

        console.log("MedicalRecordRegistry deployed to:", address(registry));
        console.log("Owner:", registry.owner());
        console.log("Network:", vm.toString(block.chainid));

        vm.stopBroadcast();
    }
}
