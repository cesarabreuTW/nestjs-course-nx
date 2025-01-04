import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Car } from './interfaces/car.interface';
import { v4 as uuid } from 'uuid';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
@Injectable()
export class CarsService {
  private cars: Car[] = [
    // {
    //   id: uuid(),
    //   brand: 'Toyota',
    //   model: 'Corolla',
    // }
  ];
  getAllCars() {
    return this.cars;
  }

  findOneById(id: string) {
    const carId = this.cars.find((carro) => carro.id === id);
    if (!carId) {
      throw new NotFoundException(`El carro con id ${id} no existe`);
    }
    return carId;
  }

  create(car: CreateCarDto) {
    const newCar: Car = {
      id: uuid(),
      ...car,
    };
    return this.cars.push(newCar);
  }

  update(id: string, updateCarDto: UpdateCarDto) {
    let carDb = this.findOneById(id);
    this.cars = this.cars.map((car) => {
      if (car.id === id) {
        carDb = { ...car, ...updateCarDto, id };
        return carDb;
      }
      return car;
    });
    return updateCarDto;
  }

  delete(id: string) {
    const arreglo = this.cars;
    const idFinder = this.cars.find((car) => car.id === id);
    if (idFinder === undefined) {
      throw new BadRequestException(`No se encontró el ${id} a eliminar`);
    }
    const idAEliminar = id;
    const nuevoArreglo = arreglo.filter((objeto) => objeto.id !== idAEliminar);
    this.cars = nuevoArreglo;

    return idFinder;
  }

  fillCarsWithSeed(cars: Car[]) {
    this.cars = cars;
  }
}
