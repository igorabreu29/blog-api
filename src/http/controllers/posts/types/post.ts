export interface Post {
	id: string
	user_id: string
	title: string
	description: string
	image: string
}

export interface PostDetails {
	id: string
	title: string
	description: string
	image: string
	created_at: Date
	name: string
	likes: string
	comments_quantity: string
	comments: {
		id: string | null
		comment: string | null
		name: string | null
	}[]
}
