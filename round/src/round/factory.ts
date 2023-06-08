import {
  RoundCreated as RoundCreatedEvent,
  StrategyContractCreated as StrategyCreatedEvent,
} from "../../generated/Round/RoundFactory"

import { PayoutStrategy, Project, Round } from "../../generated/schema";
import { RoundImplementation, MerklePayoutStrategyImplementation } from  "../../generated/templates";
import {
  RoundImplementation as RoundImplementationContract
} from "../../generated/templates/RoundImplementation/RoundImplementation";
import {
  MerklePayoutStrategyImplementation as MerklePayoutStrategy
} from "../../generated/templates/RoundImplementation/MerklePayoutStrategyImplementation";

import { updateMetaPtr } from "../utils";
import { BigInt, log } from "@graphprotocol/graph-ts";

const VERSION = "0.1.0";

/**
 * @dev Handles indexing on RoundCreatedEvent event.
 * @param event RoundCreatedEvent
 */
export function handleRoundCreated(event: RoundCreatedEvent): void {

  const roundContractAddress = event.params.roundAddress;
  let round = Round.load(roundContractAddress.toHex());

  if (round) {
    log.warning("--> handleRoundCreated {} : round already exists", [roundContractAddress.toHex()]);
    return;
  }

  // create new round entity
  round = new Round(roundContractAddress.toHex());

  // load round contract
  const roundContract = RoundImplementationContract.bind(roundContractAddress);

  // index global variables
  round.applicationsStartTime = roundContract.applicationsStartTime().toString();
  round.applicationsEndTime = roundContract.applicationsEndTime().toString();
  round.roundStartTime = roundContract.roundStartTime().toString();
  round.roundEndTime = roundContract.roundEndTime().toString();


  // set roundMetaPtr
  const roundMetaPtrId = ['roundMetaPtr', roundContractAddress.toHex()].join('-');
  let roundMetaPtr = roundContract.roundMetaPtr();
  let metaPtr = updateMetaPtr(
    roundMetaPtrId,
    roundMetaPtr.getProtocol(),
    roundMetaPtr.getPointer().toString()
  );
  round.roundMetaPtr = metaPtr.id;

  // set applicationsMetaPtr
  const applicationsMetaPtrId = ['applicationsMetaPtr', roundContractAddress.toHex()].join('-');
  let applicationsMetaPtr = roundContract.applicationMetaPtr();
  metaPtr = updateMetaPtr(
    applicationsMetaPtrId,
    applicationsMetaPtr.getProtocol(),
    applicationsMetaPtr.getPointer().toString()
  );

  round.applicationMetaPtr = metaPtr.id;


  // link round to program
  let project = Project.load(event.params.projectID.toHexString());
  if (!project) {
    // avoid creating a round if program does not exist
    log.warning("--> handleRoundCreated {} : project {} is null", [roundContractAddress.toHex(), event.params.projectID.toHexString()]);
    return;
  }
  round.program = project.id;

  round.votingStrategy = roundContract.votingStrategy().toHex();

  // set timestamp
  round.createdAt = event.block.timestamp;
  round.updatedAt = event.block.timestamp;

  round.version = roundContract.VERSION();
  // round.matchAmount = roundContract.matchAmount();
  // round.roundFeePercentage = roundContract.roundFeePercentage();
  // round.roundFeeAddress = roundContract.roundFeeAddress().toHex();


  round.save();

  RoundImplementation.create(roundContractAddress);
}

export function handleStrategyCreated(event: StrategyCreatedEvent): void {
  const strategyContractAddress = event.params.strategyAddress;
  const strategyImplementation = event.params.strategyImplementation;
  const roundContractAddress = event.params.roundAddress;

  if (strategyImplementation.toHexString() === '0xd8d9c9090a5651c361fd19c5669ba9aa48a8cfcd') {
    let payoutStrategy = PayoutStrategy.load(
      strategyContractAddress.toHex()
    );

    if (payoutStrategy) {
      log.warning("--> handlePayoutContractCreated {} : payoutStrategy already exists", [strategyContractAddress.toHex()]);
      return;
    }

    // create if payout contract does not exist
    payoutStrategy = new PayoutStrategy(strategyContractAddress.toHex());

    // set PayoutStrategy entity fields
    payoutStrategy.strategyName = "MERKLE";
    payoutStrategy.strategyAddress = strategyContractAddress.toHex();
    payoutStrategy.strategyImplementationAddress = strategyImplementation.toHex();
    payoutStrategy.isReadyForPayout = false;

    payoutStrategy.version = VERSION;

    // set timestamp
    payoutStrategy.createdAt = event.block.timestamp;
    payoutStrategy.updatedAt = event.block.timestamp;

    // load contract
    const merklePayoutContract = MerklePayoutStrategy.bind(strategyContractAddress);
    payoutStrategy.token = merklePayoutContract.tokenAddress().toHexString();
    payoutStrategy.matchAmount = merklePayoutContract.matchAmount();

    payoutStrategy.save();

    MerklePayoutStrategyImplementation.create(strategyContractAddress);

    let round = Round.load(roundContractAddress.toHexString());
    if (round) {
      round.payoutStrategy = payoutStrategy.id;
      round.save();
    }
  }

  // TODO - direct strategy
}
