import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import md5 from 'blueimp-md5';

interface GravatarProps {
  email: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

const GravatarImage = ({ email, size = 100, style }: GravatarProps) => {
  // Nettoyage de l'email et hachage
  const cleanEmail = email.trim().toLowerCase();
  const hash = md5(cleanEmail);
  
  // Construction de l'URL avec fallback 'retro' (tu peux mettre 'identicon' ou 'mp')
  const uri = `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`;

  return (
    <Image 
      source={{ uri }} 
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]} 
    />
  );
};

export default GravatarImage;