// TODO: wait until ipfs.cat is supported in studio
import { BigInt, crypto,
  ethereum,
  // ipfs,
  // json,
  JSONValue } from '@graphprotocol/graph-ts'
import { ByteArray } from '@graphprotocol/graph-ts';
import { MetaPtr, RoundApplication, StatusSnapshot } from '../generated/schema';

/**
 * Returns keccak256 of array after elements are joined by '-'
 * @param Array<String>
 * @returns keccak256
 */
export function generateID(array: Array<string>): string {
  return crypto.keccak256(
    ByteArray.fromUTF8(array.join('-'))
  ).toBase58();
}

/**
 * Updates MetaPtr if it exists, otherwise creates a new one and returns it
 * @param metaPtrId string
 * @param protocol i32
 * @param pointer string
 * @returns MetaPtr
 */
export function updateMetaPtr(metaPtrId: string, protocol: BigInt, pointer: string): MetaPtr {
  // metaPtr
  let metaPtr = MetaPtr.load(metaPtrId)
  metaPtr = metaPtr == null ? new MetaPtr(metaPtrId) : metaPtr;

  // update metaPtr
  metaPtr.protocol = protocol;
  metaPtr.pointer = pointer;

  // save metaPtr
  metaPtr.save();

  return metaPtr;
}

/**
 * Creates a StatusSnapshot
 * @param metaPtrId string
 * @param protocol i32
 * @param pointer string
 * @returns MetaPtr
 */
export function createStatusSnapshot(roundApplication: RoundApplication, status: i32, event: ethereum.Event): StatusSnapshot {
  let statusSnapshot = new StatusSnapshot([roundApplication.id.toString(), status.toString()].join('-'));
  statusSnapshot.application = roundApplication.id;
  statusSnapshot.status = status;
  statusSnapshot.timestamp = event.block.timestamp;

  return statusSnapshot;
}

/**
 * Returns metaPtr data based on protocol and pointer
 * @param protocol { number }
 * @param pointer { string }
 * @returns JSONValue
 */
export function fetchMetaPtrData(protocol: number , pointer: string) : JSONValue | null {

  // TODO: wait until ipfs.cat is supported in studio

  // let metaPtrData: JSONValue;
  // if (protocol == 1) {
  //   const ipfsData = ipfs.cat(pointer);

  //   if (!ipfsData) return null;

  //   metaPtrData = json.fromBytes(ipfsData);
  //   return metaPtrData;
  // }

  return null;
}
