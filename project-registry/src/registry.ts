import { log, store } from "@graphprotocol/graph-ts";

import {
  MetadataUpdated as MetadataUpdatedEvent,
  RoleGranted as OwnerAddedEvent,
  RoleRevoked as OwnerRemovedEvent,
} from "../generated/Registry/Registry";

import {
  Account,
  AccountProject,
  MetaPtr,
  Project,
} from "../generated/schema";
import { generateID } from "./utils";

const PROJECT_METADATA = i32(0);

export function handleMetadataUpdated(event: MetadataUpdatedEvent): void {
  log.debug("handleMetadataUpdated: {}", [event.params.projectID.toString()]);
  let project = Project.load(event.params.projectID.toHexString());

  if (project === null) {
    log.warning("handleMetadataUpdated - project {} not found", [
      event.params.projectID.toHexString(),
    ]);
    return;
  }

  if (event.params.metadataType === PROJECT_METADATA) {
    let metaPtr = new MetaPtr('project-' + event.params.projectID.toHexString());
    metaPtr.protocol = event.params.metadata.protocol;
    metaPtr.pointer = event.params.metadata.pointer;
    metaPtr.save();

    project.projectMetadata = metaPtr.id;
    project.save();
  } else {
    let metaPtr = new MetaPtr('program-' + event.params.projectID.toHexString());
    metaPtr.protocol = event.params.metadata.protocol;
    metaPtr.pointer = event.params.metadata.pointer;
    metaPtr.save();

    project.programMetadata = metaPtr.id;
    project.save();
  }

}

export function handleOwnerAdded(event: OwnerAddedEvent): void {
  log.debug("handleOwnerAdded: {} - ", [
    event.params.role.toString(),
    event.params.account.toHexString(),
  ]);
  let account = Account.load(event.params.account.toHexString());

  if (account === null) {
    log.debug("handleOwnerAdded - new account", []);
    account = new Account(event.params.account.toHexString());
    account.address = event.params.account.toHex();
    account.save();
  }

  let project = Project.load(event.params.role.toHexString());

  // when project is created the first event to be emitted is RoleGranted
  // so we handle the creation of a new Project here
  if (project === null) {
    project = new Project(event.params.role.toHexString());
    project.save();
  }

  let accountProject = new AccountProject(
    generateID([project.id, account.address])
  );
  accountProject.account = account.id;
  accountProject.project = project.id;
  accountProject.save();
}

export function handleOwnerRemoved(event: OwnerRemovedEvent): void {
  let account = Account.load(event.params.account.toHexString());

  if (account === null) {
    log.warning("handleOwnerRemoved - account {} not found", [
      event.params.account.toHexString(),
    ]);
    return;
  }

  let project = Project.load(event.params.role.toHexString());

  if (project === null) {
    log.warning("handleOwnerRemoved - project {} not found", [
      event.params.role.toHexString(),
    ]);
    return;
  }

  let accountProject = AccountProject.load(
    generateID([project.id, account.address])
  );

  if (accountProject === null) {
    log.warning("handleOwnerRemoved - AccountProject {} not found", [
      generateID([project.id, account.address]),
    ]);
    return;
  }

  store.remove("AccountProject", accountProject.id);
}
