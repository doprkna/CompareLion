"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Zap, 
  Star, 
  Coins, 
  Award, 
  Shield, 
  Sword, 
  Crown,
  Shirt,
  Footprints,
  Gem,
  User
} from 'lucide-react';

interface CharacterStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  level: number;
  gold: number;
  experience: number;
  maxExperience: number;
}

interface Equipment {
  head: string | null;
  chest: string | null;
  legs: string | null;
  weapon: string | null;
  shield: string | null;
  accessory: string | null;
}

interface Attributes {
  strength: number;
  intelligence: number;
  dexterity: number;
  luck: number;
}

const EquipmentSlot = ({ 
  slot, 
  item, 
  icon, 
  onClick 
}: { 
  slot: string; 
  item: string | null; 
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <Card 
    className="w-24 h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
    onClick={onClick}
  >
    <CardContent className="p-2 flex flex-col items-center justify-center h-full">
      <div className="text-muted-foreground mb-1">
        {icon}
      </div>
      <p className="text-xs text-center text-muted-foreground">
        {item || "Empty"}
      </p>
    </CardContent>
  </Card>
);

const InventorySlot = ({ 
  item, 
  onClick 
}: { 
  item: string | null; 
  onClick: () => void;
}) => (
  <Card 
    className="w-16 h-16 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
    onClick={onClick}
  >
    <CardContent className="p-2 flex items-center justify-center h-full">
      <p className="text-xs text-center text-muted-foreground">
        {item || "Empty"}
      </p>
    </CardContent>
  </Card>
);

const StatBar = ({ 
  current, 
  max, 
  label, 
  icon, 
  color 
}: { 
  current: number; 
  max: number; 
  label: string; 
  icon: React.ReactNode;
  color: string;
}) => {
  const percentage = (current / max) * 100;
  
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2 min-w-[100px]">
        <div className="text-muted-foreground">
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-mono text-muted-foreground min-w-[80px] text-right">
        {current}/{max}
      </span>
    </div>
  );
};

const AttributeCard = ({ 
  name, 
  value, 
  icon 
}: { 
  name: string; 
  value: number; 
  icon: React.ReactNode;
}) => (
  <Card className="hover:bg-muted/50 transition-colors">
    <CardContent className="p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="text-primary">
          {icon}
        </div>
        <span className="font-medium">{name}</span>
      </div>
      <span className="text-2xl font-bold text-primary">{value}</span>
    </CardContent>
  </Card>
);

export default function CharacterPage() {
  const [stats, setStats] = useState<CharacterStats>({
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    level: 1,
    gold: 0,
    experience: 0,
    maxExperience: 100,
  });

  const [equipment, setEquipment] = useState<Equipment>({
    head: null,
    chest: null,
    legs: null,
    weapon: null,
    shield: null,
    accessory: null,
  });

  const [attributes, setAttributes] = useState<Attributes>({
    strength: 1,
    intelligence: 1,
    dexterity: 1,
    luck: 1,
  });

  const [inventory, setInventory] = useState<(string | null)[]>(
    Array(16).fill(null)
  );

  const handleEquipmentClick = (slot: keyof Equipment) => {
    // Placeholder for equipment management
    console.log(`Clicked equipment slot: ${slot}`);
  };

  const handleInventoryClick = (index: number) => {
    // Placeholder for inventory management
    console.log(`Clicked inventory slot: ${index}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Character</h1>
          <p className="text-gray-600">Manage your character's stats, equipment, and inventory</p>
        </div>

        {/* Character Portrait */}
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-16 h-16 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Adventurer</h2>
            <p className="text-muted-foreground">Level {stats.level} Character</p>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Character Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatBar
              current={stats.health}
              max={stats.maxHealth}
              label="Health"
              icon={<Heart className="w-4 h-4" />}
              color="bg-red-500"
            />
            <StatBar
              current={stats.mana}
              max={stats.maxMana}
              label="Mana"
              icon={<Zap className="w-4 h-4" />}
              color="bg-blue-500"
            />
            <StatBar
              current={stats.experience}
              max={stats.maxExperience}
              label="Experience"
              icon={<Award className="w-4 h-4" />}
              color="bg-yellow-500"
            />
            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="font-medium">Level: {stats.level}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Gold: {stats.gold}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Equipment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <EquipmentSlot
                slot="head"
                item={equipment.head}
                icon={<Crown className="w-6 h-6" />}
                onClick={() => handleEquipmentClick('head')}
              />
              <EquipmentSlot
                slot="chest"
                item={equipment.chest}
                icon={<Shirt className="w-6 h-6" />}
                onClick={() => handleEquipmentClick('chest')}
              />
              <EquipmentSlot
                slot="legs"
                item={equipment.legs}
                icon={<Footprints className="w-6 h-6" />}
                onClick={() => handleEquipmentClick('legs')}
              />
              <EquipmentSlot
                slot="weapon"
                item={equipment.weapon}
                icon={<Sword className="w-6 h-6" />}
                onClick={() => handleEquipmentClick('weapon')}
              />
              <EquipmentSlot
                slot="shield"
                item={equipment.shield}
                icon={<Shield className="w-6 h-6" />}
                onClick={() => handleEquipmentClick('shield')}
              />
              <EquipmentSlot
                slot="accessory"
                item={equipment.accessory}
                icon={<Gem className="w-6 h-6" />}
                onClick={() => handleEquipmentClick('accessory')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attributes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Attributes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AttributeCard
                name="Strength"
                value={attributes.strength}
                icon={<Sword className="w-5 h-5" />}
              />
              <AttributeCard
                name="Intelligence"
                value={attributes.intelligence}
                icon={<Zap className="w-5 h-5" />}
              />
              <AttributeCard
                name="Dexterity"
                value={attributes.dexterity}
                icon={<Shield className="w-5 h-5" />}
              />
              <AttributeCard
                name="Luck"
                value={attributes.luck}
                icon={<Gem className="w-5 h-5" />}
              />
            </CardContent>
          </Card>

          {/* Inventory Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coins className="w-5 h-5" />
                <span>Inventory</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {inventory.map((item, index) => (
                  <InventorySlot
                    key={index}
                    item={item}
                    onClick={() => handleInventoryClick(index)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button variant="outline">
            Level Up
          </Button>
          <Button variant="outline">
            Shop
          </Button>
          <Button variant="outline">
            Quest
          </Button>
        </div>
      </div>
    </div>
  );
}
