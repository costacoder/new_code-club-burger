import * as Yup from 'yup'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import authConfig from '../../config/auth'

class SessionControler {
  async store(request, response) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    })

    const userEmailOrPasswordIndorrect = () => {
      return response
        .status(401)
        .json({ error: 'Make sure your password or email are correct' })
    }
    if (!(await schema.isValid(request.body))) userEmailOrPasswordIndorrect()

    const { email, password } = request.body

    const user = await User.findOne({
      where: { email },
    })

    if (!user) userEmailOrPasswordIndorrect()

    if (!(await user.checkPassword(password))) userEmailOrPasswordIndorrect()

    return response.json({
      id: user.id,
      email,
      name: user.name,
      admin: user.admin,
      token: jwt.sign({ id: user.id, name: user.name }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    })
  }
}

export default new SessionControler()
