const { user, post, post_contents, post_image, post_post_contents, post_post_image, tags } = require('../../models')
const { isAuthorized } = require('../tokenFunction/index')

module.exports = async (req, res) => {
console.log('요청')
  const accessTokenData = isAuthorized(req, res);
  const { title, image, postcontents, season, local } = req.body;

  if(accessTokenData && title && image && postcontents && season && local) {
    const data = await accessTokenData
    .then(user => { return user })

    const userData = await user.findOne({
      where: { email: data.email }
    })

    // post 테이블 추가 부분
    const createdPost = await post.create({
      title: title,
      viewCount: 0,
      userId: userData.id
    })
    // tags 테이블 추가 부분
    const tagCreate = await tags.create({
      seasonTag: season,
      localTag: local,
      postId: createdPost.id
    })


    // contents 테이블 추가 부분
    const postedContents = await post_contents.create({
      contents: postcontents
    })
    await post_post_contents.create({
      postId: createdPost.id,
      postContentId: postedContents.id
    })

    // image 테이블 추가 부분
    const postedimage = await post_image.create({
      image: image
    })
    await post_post_image.create({
      postId: createdPost.id,
      postImageId: postedimage.id
    })

    // 생성한 post의 contents 데이터 조회
    const postPostContents = await post_post_contents.findOne({
      include: [
        {
          model: post,
          attributes: ["id"]
        }
      ],
      where: { postId: createdPost.id }
    })
    const findContent = await post_contents.findOne({
      include: [
        {
          model: post_post_contents,
          attributes: ["postContentId"]
        }
      ],
      where: { id: postPostContents.postContentId }
    })

    // 생성한 post의 image 데이터 조회
    const postPostImage = await post_post_image.findOne({
      include: [
        {
          model: post,
          attributes: ["id"]
        }
      ],
      where: { postId: createdPost.id }
    })
    const findImage = await post_image.findOne({
      include: [
        {
          model: post_post_image,
          attributes: ["postImageId"]
        }
      ],
      where: { id: postPostImage.postImageId }
    })

    /* 
      새로 생성된 post 아이디
      새로 생성된 post 타이틀
      새로 생성된 post 조회수
      새로 생성된 post 이미지 경로
      새로 생성된 post 본문
      새로 생성된 post createdAt
      새로 생성된 post updatedAt
      새로 생성된 post 생성자 user id
    */

    const uploadPost = {
      id: createdPost.id,
      title: createdPost.title,
      viewCount: createdPost.viewCount,
      url: findImage.image,
      postcontents: findContent.contents,
      createdAt: createdPost.createdAt,
      updatedAt: createdPost.updatedAt,
      userId: userData.id,
      tags: [
        {
          localTag: local,
          seasonTag: season
        }
      ]
    }

    res.status(201).json({ data: { post: uploadPost } })
  } else {
    res.status(400).send("인증되지 않은 사용자입니다.")
  }

}
