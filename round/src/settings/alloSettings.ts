import {
  ProtocolFeePercentageUpdated as ProtocolFeePercentageUpdatedEvent,
  ProtocolTreasuryUpdated as ProtocolTreasuryUpdatedEvent
} from "../../generated/AlloSettings/AlloSettings";

import { AlloSetting } from "../../generated/schema";

/**
 * Handles indexing on ProtocolFeePercentageUpdated event.
 * @param event ProtocolFeePercentageUpdatedEvent
 */
export function handleProtocolFeePercentageUpdated(event: ProtocolFeePercentageUpdatedEvent): void {
  let alloSettingsId = event.address.toHexString();
  // Get the updated protocol fee percentage value from the event
  let protocolFeePercentage = event.params.protocolFeePercentage;

  // Update the protocol fee percentage value in the AlloSettings entity
  let alloSettings = AlloSetting.load(alloSettingsId);

  if (alloSettings == null) {
    alloSettings = new AlloSetting(alloSettingsId);
  }

  alloSettings.protocolFeePercentage = protocolFeePercentage;
  alloSettings.save();
}


/**
 * Handles indexing on ProtocolTreasuryUpdated event.
 * @param event ProtocolTreasuryUpdatedEvent
 */
export function handleProtocolTreasuryUpdated(event: ProtocolTreasuryUpdatedEvent): void {
  let alloSettingsId = event.address.toHexString();

  // Get the updated protocol treasury address from the event
  let protocolTreasury = event.params.protocolTreasuryAddress.toHexString();

  // Update the protocol treasury address value in the AlloSettings entity
  let alloSettings = AlloSetting.load(alloSettingsId);

  if (alloSettings == null) {
    alloSettings = new AlloSetting(alloSettingsId);
  }

  alloSettings.protocolTreasury = protocolTreasury;
  alloSettings.save();
}
