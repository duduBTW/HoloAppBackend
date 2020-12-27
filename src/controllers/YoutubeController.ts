import reusltItem, { resultItemType } from '@models/ResultItem'
import { youtube } from 'googleapis/build/src/apis/youtube'
import { Content } from 'src/entity/Content'
import { Sync } from 'src/entity/Sync'
import { getRepository } from 'typeorm'

export default new class YoutubeController {
  public parseYoutubeResponse = (resultTemp) => {
    const result: Array<reusltItem> = []

    for (let index = 0; index < resultTemp.data.items.length; index++) {
      const element = resultTemp.data.items[index]
      if (element.snippet) {
        result.push({
          id: element.snippet.resourceId.videoId,
          type: resultItemType.Youtube,
          date: element.snippet.publishedAt,
          title: element.snippet.title,
          image: {
            medium: element.snippet.thumbnails.medium.url,
            higth: element.snippet.thumbnails.high.url
          }
        })
      }
    }

    return result
  }

  public save = async (dataList: reusltItem[]) => {
    console.log('data', dataList)
    const contentRepo = getRepository(Content)

    const content = dataList.map(data => contentRepo.create({
      title: data.title,
      image: data.image.higth,
      date: data.date,
      type: 1,
      integrationId: data.id
    }))

    await contentRepo.save(content)

    return content
  }

  async findAll (take: number = 10, skip: number = 0): Promise<{ data: Content[], count: number }> {
    const contentRepo = getRepository(Content)

    const [result, total] = await contentRepo.findAndCount(
      {
        // where: { name: Like('%' + keyword + '%') },
        order: { date: 'DESC' },
        take: take,
        skip: skip
      }
    )

    return {
      data: result,
      count: total
    }
  }

  public syncYoutubeWithTable = async (channelId: string) => {
    const contentRepo = getRepository(Content)

    const storedVideo = await contentRepo.find(
      {
        take: 1,
        order: {
          date: 'DESC'
        }
      }
    )
    console.log('date', storedVideo[0])

    const videosToUpdate = await youtube('v3').search.list({
      channelId,
      part: ['snippet'],
      key: process.env.YOUTUBE_TOKEN,
      publishedAfter: storedVideo[0].date.toISOString()
    })

    console.log(videosToUpdate.data.items)

    const contentNoRepeat = videosToUpdate.data.items.filter(item => item.id.videoId !== storedVideo[0].integrationId)

    contentNoRepeat.map(async video => {
      const content = contentRepo.create({
        title: video.snippet.title,
        date: video.snippet.publishedAt,
        type: 1,
        integrationId: video.id.videoId
      })

      await contentRepo.save(content)
    })
    console.log('videosToUpdate', contentNoRepeat)

    const syncRepo = getRepository(Sync)
    syncRepo.save({ talentId: channelId, lastSynced: new Date() })

    // const userY = await youtube('v3').channels.list({
    //   id: [channelId.toString()],
    //   part: ['contentDetails'],
    //   key: process.env.YOUTUBE_TOKEN
    // })

    // const resultApiY = await youtube('v3').playlistItems.list({
    //   playlistId: userY.data.items[0].contentDetails.relatedPlaylists.uploads,
    //   part: ['snippet'],
    //   key: process.env.YOUTUBE_TOKEN,
    //   maxResults: 10
    // })

    // const parsedRes = this.parseYoutubeResponse(resultApiY)

    // parsedRes.forEach(async video => {
    //   var videos = await contentRepo.findOne({
    //     where: {
    //       integrationId: video.id
    //     }
    //   })

    //   if (!videos) {
    //     contentRepo.create({
    //       title: video.title,
    //       image: video.image.higth,
    //       date: video.date,
    //       type: 1,
    //       integrationId: video.id
    //     })
    //   }
    // })
  }
}()
