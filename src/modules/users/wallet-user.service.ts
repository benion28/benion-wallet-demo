// src/modules/users/wallet-user.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletUser, WalletUserDocument } from '../../schemas/wallet-user.schema';
import { CreateWalletUserDto } from './dto/create-wallet-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../auth/enums/user-role.enum';
import { UpdateWalletUserDto } from './dto/update-wallet-user.dto';

@Injectable()
export class WalletUserService {
  constructor(
    @InjectModel(WalletUser.name) 
    private walletUserModel: Model<WalletUserDocument>,
  ) {}

  async findAll() {
    return this.walletUserModel.find().exec();
  }

  async findOne(id: string) {
    return this.walletUserModel.findById(id).exec();
  }

  async findById(id: string) {
    return this.walletUserModel.findById(id).exec();
  }

  async findByIdAndPopulate(id: string) {
    return this.walletUserModel.findById(id).populate('roles').exec();
  }

  async findByEmail(email: string) {
    try {
      return await this.walletUserModel
        .findOne({ email })
        .select('+password') // Include password for validation
        .exec();
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async create(createUserDto: CreateWalletUserDto) {
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
      const result = savedUser.toObject();
      delete result.password;
      
      return result;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      console.error('Error creating user:', error);
      throw error;
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async remove(id: string) {
    const result = await this.walletUserModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return result;
  }
}