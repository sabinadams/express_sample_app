import { prisma } from '../lib/prisma'
import randomColor from 'randomcolor'

export const upsertTags = async (tags: string[]) => {
	return await prisma.$transaction(async tx => {
		const existingTags = await tx.tag.findMany({
			select: { id: true, name: true },
			where: { name: { in: tags } }
		})

		const names = existingTags.map(tag => tag.name)
		const ids = existingTags.map(tag => tag.id)

		for (const tag in tags) {
			if (!names.includes(tag)) {
				const newTag = await tx.tag.create({
					select: { id: true },
					data: {
						name: tag,
						color: randomColor({
							luminosity: 'light'
						})
					}
				})
				ids.push(newTag.id)
			}
		}

		return ids
	})
}

export const deleteOrphanedTags = async (ids: number[]) => {
	return await prisma.tag.deleteMany({
		where: {
			quotes: { none: {} },
			id: { in: ids }
		}
	})
}
