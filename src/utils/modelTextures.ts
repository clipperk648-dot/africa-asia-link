export interface ModelTextureConfig {
  color?: string;
  normal?: string;
  roughness?: string;
  metalness?: string;
  ao?: string;
  bump?: string;
  emissive?: string;
}

export const getModelTextureConfig = (modelId: string): ModelTextureConfig | undefined => {
  switch (modelId) {
    case "watch":
      return {
        color: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=512&h=512&fit=crop",
        metalness: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=512&h=512&fit=crop",
        roughness: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=512&h=512&fit=crop",
        normal: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=512&h=512&fit=crop",
        ao: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=512&h=512&fit=crop",
      };
    case "coke_can":
      return {
        color: "https://images.unsplash.com/photo-1554866585-06b2a6fb9baf?w=512&h=512&fit=crop",
        metalness: "https://images.unsplash.com/photo-1551033406-611cf9a28f41?w=512&h=512&fit=crop",
        roughness: "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=512&h=512&fit=crop",
        normal: "https://images.unsplash.com/photo-1599599810694-b5ac4dd64e2d?w=512&h=512&fit=crop",
        bump: "https://images.unsplash.com/photo-1516738901601-b51b3ec5a060?w=512&h=512&fit=crop",
      };
    case "iphone":
      return {
        color: "https://images.unsplash.com/photo-1510498805757-ba5a4d1fbf83?w=512&h=512&fit=crop",
        metalness: "https://images.unsplash.com/photo-1535946365326-50a1ff56a0a8?w=512&h=512&fit=crop",
        roughness: "https://images.unsplash.com/photo-1511235642339-9c8f319f1dd9?w=512&h=512&fit=crop",
        normal: "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=512&h=512&fit=crop",
      };
    case "bike":
      return {
        color: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=512&h=512&fit=crop",
        metalness: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=512&h=512&fit=crop",
        roughness: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=512&h=512&fit=crop",
        normal: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=512&h=512&fit=crop",
      };
    default:
      return undefined;
  }
};

export const getModelRepeat = (modelId: string): [number, number] => {
  switch (modelId) {
    case "watch":
    case "iphone":
      return [1, 1];
    case "coke_can":
      return [2, 1];
    case "bike":
      return [1, 1];
    default:
      return [1, 1];
  }
};
