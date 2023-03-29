import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Cart, CartDocument } from './schema/cart.schema';
import { CreateItemDTO } from './dtos/create-item.dto';

@Injectable()
export class CartService {
  constructor(@InjectModel('Cart') private readonly cartModel: Model<CartDocument>) {}

  async createCart(
    userId: string,
    createItemDTO: CreateItemDTO,
    subTotalPrice: number,
    totalPrice: number,
  ): Promise<Cart> {
    const cart = await this.cartModel.create({
      userId,
      items: [{ ...createItemDTO, subTotalPrice }],
      totalPrice,
    });
    return cart.save();
  }

  async getCart(userId: string): Promise<CartDocument> {
    const cart = await this.cartModel.findById({ userId });
    return cart;
  }

  async deleteCart(userId: string) {
    const cart = await this.cartModel.findByIdAndRemove({ userId });
    return cart;
  }

  private recalculateCart(cart: CartDocument) {
    cart.totalPrice = 0;
    cart.items.forEach((item) => {
      cart.totalPrice += item.quantity * item.price;
    });
  }

  async addItemToCart(userId: string, createItemDTO: CreateItemDTO) {
    const { productId, quantity, price } = createItemDTO;
    const subTotalPrice = quantity * price;

    const cart = await this.getCart(userId);

    if (cart) {
      const itemIndex = cart.items.findIndex((item) => item.productId === productId);

      if (itemIndex > -1) {
        let item = cart.items[itemIndex];
        item.quantity = Number(item.quantity) + Number(quantity);
        item.subTotalPrice = item.quantity * item.price;

        cart.items[itemIndex] = item;
        this.recalculateCart(cart);

        return cart.save();
      } else {
        cart.items.push({ ...createItemDTO, subTotalPrice });
        this.recalculateCart(cart);
        return cart.save();
      }
    } else {
      const newCart = await this.createCart(userId, createItemDTO, subTotalPrice, price);
      return newCart;
    }
  }

  async removeItemCart(userId: string, productId: string) {
    const cart = await this.getCart(userId);

    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      this.recalculateCart(cart);
      return cart.save();
    }
  }
}
