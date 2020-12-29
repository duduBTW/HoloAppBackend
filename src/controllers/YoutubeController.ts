import reusltItem, { resultItemType } from '@models/ResultItem'
import { youtube } from 'googleapis/build/src/apis/youtube'
import { Branch } from 'src/entity/Branch'
import { Content } from 'src/entity/Content'
import { Sync } from 'src/entity/Sync'
import { Talent } from 'src/entity/Talent'
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
          image: element.snippet.thumbnails.medium.url
          // {
          // higth: element.snippet.thumbnails.high.url
          // }
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
      image: data.image,
      date: data.date,
      type: 1,
      integrationId: data.id
    }))

    await contentRepo.save(content)

    return content
  }

  async findAll (take: number = 10, skip: number = 0): Promise<{ data: Content[], count: number | null }> {
    const contentRepo = getRepository(Content)

    const [result, total] = await contentRepo.findAndCount(
      {
        // where: { nam e: Like('%' + keyword + '%') },
        order: { date: 'DESC' },
        take: take,
        skip: skip * take
      }
    )

    console.log(result)

    return {
      data: result,
      count: total
    }
  }

  public syncYoutubeWithTableAll = async (talent: Talent) => {
    let shouldContinue = true
    let pageToken = null
    const contentRepo = getRepository(Content)
    let result = []
    const userY = await youtube('v3').channels.list({
      id: [talent.youtubeId],
      part: ['contentDetails'],
      key: process.env.YOUTUBE_TOKEN
    })

    while (shouldContinue) {
      const resultApiY = await youtube('v3').playlistItems.list({
        playlistId: userY.data.items[0].contentDetails.relatedPlaylists.uploads,
        part: ['snippet'],
        key: process.env.YOUTUBE_TOKEN,
        maxResults: 50,
        pageToken
      })

      const { items, nextPageToken } = resultApiY.data
      result = [...result, ...items]
      if (!nextPageToken) {
        shouldContinue = false
      } else {
        pageToken = nextPageToken
      }
    }

    console.log('resultApiY', result.length)
    // const video = result[0]
    // const content = contentRepo.create({
    //   title: video.snippet.title,
    //   date: video.snippet.publishedAt,
    //   type: 1,
    //   integrationId: video.snippet.resourceId.videoId,
    //   image: video.snippet.thumbnails.medium.url,
    //   talent: talent
    // })
    const content = result.map(video => contentRepo.create({
      title: video.snippet.title,
      date: video.snippet.publishedAt,
      type: 1,
      integrationId: video.snippet.resourceId.videoId,
      image: video.snippet.thumbnails.medium.url,
      talent: talent
    }))
    console.log(content)
    await contentRepo.save(content).catch(err => console.log(err))

    // Hololive English
  }

  public createBranch = async (name: string) => {
    const branchRepo = getRepository(Branch)

    const result = branchRepo.create({
      name
    })

    await branchRepo.save(result).catch(erro => {
      throw erro
    })

    return true
  }

  public createTalent = async () => {
    const talentRepo = getRepository(Talent)
    const branchRepo = getRepository(Branch)

    const branch = await branchRepo.findOne({
      where: {
        branchId: '48a4f162-4d3d-42ba-8ae8-fe579a3adb5f'
      }
    })

    const result = talentRepo.create({
      name: 'Mori Calliope',
      birthday: 'April 4th',
      debutDate: new Date('2020-09-12'),
      color: '5A263B',
      description: 'The Grim Reaper\'s first apprentice. Because the world\'s medical system advanced so dramatically, Calliope became a VTuber to collect souls. It seems that the lost souls vaporized by the wholesome relationships of VTubers flow through her as well. In the end, she\'s a gentle-hearted girl whose sweet voice contradicts the morbid things she tends to say, as well as her hardcore vocals.',
      heigth: '167',
      image: 'https://firebasestorage.googleapis.com/v0/b/hololive-6a02e.appspot.com/o/calli.jpeg?alt=media&token=8e738758-fc76-426d-a961-967e5f74a55e',
      twitterName: 'moricalliope',
      youtubeId: 'UCL_qhgtOy0dy1Agp8vkySQg',
      branch: branch
    })

    await talentRepo.save(result).catch(erro => {
      throw erro
    })

    return true
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
