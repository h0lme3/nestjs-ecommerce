import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schema/product.schema';
import { CreateProductDTO } from './dtos/create-product.dto';
import { FilterProductDTO } from './dtos/filter-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getFilteredProducts(filterProductDTO: FilterProductDTO): Promise<Product[]> {
    const { search, category } = filterProductDTO;
    let products = await this.getAllProducts();

    if (search) {
      products = products.filter((product) => product.name.includes(search) || product.category.includes(search));
    }

    if (category) {
      products = products.filter((product) => product.category === category);
    }

    return products;
  }

  async getAllProducts(): Promise<Product[]> {
    const products = await this.productModel.find().exec();
    return products;
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    return product;
  }

  async addProduct(createProductDTO: CreateProductDTO): Promise<Product> {
    const newProduct = await this.productModel.create(createProductDTO);
    return newProduct.save();
  }

  async updateProduct(id: string, updateProductDTO: CreateProductDTO): Promise<Product> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(id, updateProductDTO, { new: true });
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<Product> {
    const deletedProduct = await this.productModel.findByIdAndRemove(id);
    return deletedProduct;
  }
}
