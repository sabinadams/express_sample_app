import { prisma } from '../lib/prisma'
import randomColor from 'randomcolor'

export const upsertTags = async (tags: string[]) => {
	return await prisma.$transaction(async tx => {
		const existingTags = await tx.tag.findMany({
			select: { id: true, name: true },
			where: { name: { in: tags } }
		})

		const existingNames = existingTags.map(tag => tag.name)
		const existingIDs = existingTags.map(tag => tag.id)

		const createdCount = await tx.tag.createMany({
			data: tags
				.filter(tag => !existingNames.includes(tag))
				.map(tag => ({
					name: tag,
					color: randomColor({ luminosity: 'light' })
				}))
		})

		const tagIds = existingTags.map(tag => tag.id)

		if (createdCount) {
			const createdTags = await tx.tag.findMany({
				select: { id: true },
				where: {
					name: { in: existingNames },
					id: { notIn: existingIDs }
				}
			})

			const createdIds = createdTags.map(tag => tag.id)
			tagIds.push(...createdIds)
		}

		return tagIds
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
