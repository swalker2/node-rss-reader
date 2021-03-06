import { connect } from '@services/database';
import { encrypt } from '@util/bcrypt';
import { ObjectId } from 'mongodb';

export interface UserInterface {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PresentUser {
  _id: string;
  email: string;
  name: string;
  is_admin?: boolean;
}

class UserRepository {
  async create({
    name,
    email,
    password,
  }: UserInterface): Promise<UserInterface> {
    const { db } = await connect();

    const response = await db.collection<UserInterface>('users').insertOne({
      _id: new ObjectId(),
      name,
      email,
      password: await encrypt(password),
      created_at: new Date(),
      updated_at: new Date(),
    });

    return response.ops[0];
  }

  public async findByEmail(email: string): Promise<UserInterface> {
    const { db } = await connect();

    return await db.collection<UserInterface>('users').findOne({ email });
  }

  present(user: UserInterface): PresentUser {
    return {
      _id: user._id.toHexString(),
      email: user.email,
      name: user.name,
      is_admin: user.email === process.env.ADMIN_EMAIL,
    };
  }

  async find(id: ObjectId): Promise<UserInterface> {
    const { db } = await connect();

    return await db.collection<UserInterface>('users').findOne({ _id: id });
  }

  async update(user: UserInterface): Promise<UserInterface> {
    const { db } = await connect();

    const emailExists = await db
      .collection<UserInterface>('users')
      .findOne({ email: user.email, _id: { $ne: user._id } });

    if (emailExists) {
      throw new Error('Email is already taken.');
    }

    await db
      .collection<UserInterface>('users')
      .findOneAndReplace(
        { _id: user._id },
        { ...user, updated_at: new Date() },
      );

    return user;
  }
}

export default new UserRepository();
