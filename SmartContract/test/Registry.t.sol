// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {MedicalRecordRegistry} from "../src/MedicalRecordRegistry.sol";

contract RegistryTest is Test {
    MedicalRecordRegistry public registry;

    function setUp() public {
        registry = new MedicalRecordRegistry();
    }

    function registerProvider() public {
        registry.registerProvider('Doctor 1', 'Surgeon');
        assertEq(registry.getProvider().length, 1);
    }

}
