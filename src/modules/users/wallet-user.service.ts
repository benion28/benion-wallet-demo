// src/modules/users/wallet-user.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletUser, WalletUserDocument } from '../../schemas/wallet-user.schema';
import { CreateWalletUserDto } from './dto/create-wallet-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../auth/enums/user-role.enum';
import { UpdateWalletUserDto } from './dto/update-wallet-user.dto';
import { CustomApiResponse } from '../../common/interfaces/api-response.interface';

@Injectable()
export class WalletUserService {
  constructor(
    @InjectModel(WalletUser.name) 
    private walletUserModel: Model<WalletUserDocument>,
  ) {}

  async findAll() {
    const users = await this.walletUserModel.find().exec();
    return CustomApiResponse.success({
      message: 'Users retrieved successfully',
      status: 200,
      data: users
    });
  }

  async findOne(id: string): Promise<WalletUserDocument | null> {
    return await this.walletUserModel.findById(id).exec();
  }

  async findById(id: string): Promise<WalletUserDocument | null> {
    return await this.walletUserModel.findById(id).exec();
  }

  async findByIdAndPopulate(id: string) {
    return CustomApiResponse.success({
      data: await this.walletUserModel.findById(id).populate('roles').exec()
    });
  }

  async findByEmail(email: string): Promise<WalletUserDocument> {
    try {
      return this.walletUserModel
          .findOne({ email })
          .select('+password') // Include password for validation
          .exec();
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async create(createUserDto: CreateWalletUserDto): Promise<WalletUserDocument> {
    try {
      // Create the user document
      const user = new this.walletUserModel({
        email: createUserDto.email,
        password: createUserDto.password,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phoneNumber: createUserDto.phoneNumber,
        roles: createUserDto.roles || [UserRole.USER]
      });

      // Save the document
      const savedUser = await user.save();
      
      // Convert to plain object and remove password
      const result = savedUser;
      delete result.password;
      
      return result;
    } catch (error) {
      if (error.code === 11000) {
        return null;
      }
      console.error('Error creating user:', error);
      return null;
    }
  }

  async update(id: string, updateUserDto: UpdateWalletUserDto) {
    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.walletUserModel
      .findByIdAndUpdate(
        id,
        { $set: updateUserDto },
        { new: true, runValidators: true }
      )
      .select('-password') // Exclude password from the result
      .exec();

    if (!updatedUser) {
      return CustomApiResponse.error({
        error: `User with ID ${id} not found`
      });
    }

    return CustomApiResponse.success({
      data: updatedUser
    });
  }

  async remove(id: string) {
    const result = await this.walletUserModel.findByIdAndDelete(id).exec();
    if (!result) {
      return CustomApiResponse.error({
        error: `User with ID ${id} not found`
      });
    }
    return CustomApiResponse.success({
      data: result
    });
  }
}