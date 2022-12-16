import { prisma } from "../lib/prisma";
import randomColor from 'randomcolor';

export async function upsertTags(tags: string[]) {
  return await prisma.$transaction(async (tx) => {
    const existingTags = await tx.tag.findMany({
      select: { id: true, name: true },
      where: { name: { in: tags } }
    })

    const names = existingTags.map(tag => tag.name)
    let ids = existingTags.map(tag => tag.id)

    for ( let tag in tags ) {
      if ( !names.includes(tag) ) {
        let newTag = await tx.tag.create({
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

export async function deleteOrphanedTags(ids: number[]) {
  return await prisma.tag.deleteMany({
    where: { 
      quotes: { none: {} },
      id: { in: ids } 
    }
  })
}