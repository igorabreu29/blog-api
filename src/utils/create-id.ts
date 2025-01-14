import { v7 as uuidV7 } from 'uuid'

export function createId() {
	const id = uuidV7()
	return id
}
