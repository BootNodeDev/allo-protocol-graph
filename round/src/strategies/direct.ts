import { log, ethereum } from "@graphprotocol/graph-ts";
import {
  RoundFeePercentageUpdated as RoundFeePercentageUpdatedEvent,
  RoundFeeAddressUpdated as RoundFeeAddressUpdatedEvent,
} from "../../generated/templates/DirectStrategy/DirectStrategy";
import { DirectPayout, Payout, MetaPtr } from "../../generated/schema";
import { generateID, updateMetaPtr } from "../utils";

const VERSION = "0.1.0";


/**
 * Handles indexing on RoundFeePercentageUpdated event.
 * @param event RoundFeePercentageUpdatedEvent
 */
export function handRoundFeePercentageUpdated(event: RoundFeePercentageUpdatedEvent): void {

}

/**
 * Handles indexing on RoundFeeAddressUpdated event.
 * @param event RoundFeeAddressUpdatedEvent
 */
export function handRoundFeeAddressUpdated(event: RoundFeeAddressUpdatedEvent): void {

}
