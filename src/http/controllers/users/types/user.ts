export interface User {
	id: string
	name: string
	email: string
	role: string
	created_at: string
}

export interface UserAccount {
	id: string
	name: string
	email: string
	followers: string
	following: string
	posts: {
		id: string | null
		title: string | null
		image: string | null
	}[]
}

export interface AuthLinkWithUser {
	code: string
	user_id: string
	role: string
}
