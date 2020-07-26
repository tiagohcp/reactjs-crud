import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('/foods');

      setFoods(response.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });
      setFoods(state => [...state, response.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const updatedFoodList = foods.map(foodListed =>
      foodListed.id !== editingFood.id
        ? foodListed
        : {
            id: editingFood.id,
            available: editingFood.available,
            ...food,
          },
    );

    await api.put(`/foods/${editingFood.id}`, {
      id: editingFood.id,
      available: editingFood.available,
      ...food,
    });

    setFoods(updatedFoodList);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);

    const currentFoodList = foods.filter(food => food.id !== id);

    setFoods(currentFoodList);
  }

  async function handleEditAvailability(food: IFoodPlate): Promise<void> {
    await api.put(`/foods/${food.id}`, {
      ...food,
      available: !food.available,
    });

    const updatedFoodList = foods.map(foodList =>
      foodList.id !== food.id
        ? foodList
        : {
            ...food,
            available: !food.available,
          },
    );

    setFoods(updatedFoodList);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleEditAvailability={handleEditAvailability}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
