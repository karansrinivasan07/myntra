import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import axios from "axios";
import { useTheme } from "@/src/theme";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { API_BASE_URL } from "@/constants/Api";
import { useResponsive } from "@/src/hooks/useResponsive";
import ResponsiveContainer from "@/src/components/responsive/ResponsiveContainer";
import ResponsiveGrid from "@/src/components/responsive/ResponsiveGrid";

export default function TabTwoScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setcategories] = useState<any[]>([]);
  const { theme } = useTheme();

  const { scaleFont, spacing } = useResponsive();

  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const cat = await axios.get(`${API_BASE_URL}/category`);
        setcategories(cat.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchproduct();
  }, []);

  if (isLoading) {
    return (
      <ResponsiveContainer>
        <ThemedView style={styles.loaderContainer} colorType="background">
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </ThemedView>
      </ResponsiveContainer>
    );
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setSearchQuery("");
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setSearchQuery("");
  };

  const filtercategories = categories?.filter(
    (category: any) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.subcategory.some((subcategory: any) =>
        subcategory.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      category.productId.some(
        (product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const selectedcategorydata = selectedCategory
    ? categories?.find((cat: any) => cat._id === selectedCategory)
    : null;

  return (
    <ResponsiveContainer>
      <ThemedView style={[styles.header, { borderBottomColor: theme.colors.border, padding: spacing.md }]} colorType="background">
        <ThemedText type="title" style={[styles.headerTitle, { fontSize: scaleFont(22) }]}>Categories</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.searchContainer, { borderBottomColor: theme.colors.border, padding: spacing.md }]} colorType="background">
        <ThemedView style={[styles.searchInputContainer, { backgroundColor: theme.colors.surface }]} colorType="surface">
          <Search size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text, fontSize: scaleFont(16) }]}
            placeholder="Search for products, brands and more"
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!selectedCategory && (
          <ThemedView style={[styles.categoriesGrid, { padding: spacing.md }]} colorType="background">
            <ResponsiveGrid
              data={filtercategories}
              paddingHorizontal={spacing.md}
              gap={spacing.md}
              phoneCols={1}
              tabletCols={2}
              largeTabletCols={3}
              renderItem={(category: any) => (
                <TouchableOpacity
                  style={[styles.categoryCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}
                  onPress={() => handleCategorySelect(category._id)}
                >
                  <Image
                    source={{ uri: category.image }}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />
                  <ThemedView style={styles.categoryInfo} colorType="card">
                    <ThemedText type="subtitle" style={[styles.categoryName, { fontSize: scaleFont(18) }]}>{category.name}</ThemedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.subcategories}>
                        {category?.subcategory?.map((sub: any, idx: any) => (
                          <TouchableOpacity
                            key={idx}
                            style={[styles.subcategoryTag, { backgroundColor: theme.colors.surface }]}
                            onPress={() => handleSubcategorySelect(sub)}
                          >
                            <ThemedText type="default" colorType="textMuted" style={[styles.subcategoryText, { fontSize: scaleFont(13) }]}>{sub}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </ThemedView>
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        )}

        {selectedcategorydata && (
          <ThemedView style={[styles.categoryDetail, { padding: spacing.md }]} colorType="background">
            <View style={styles.categoryHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedCategory(null)}
              >
                <ThemedText style={{ color: theme.colors.primary, fontSize: scaleFont(16) }} type="defaultSemiBold">
                  ← Back to Categories
                </ThemedText>
              </TouchableOpacity>
              <ThemedText type="title" style={[styles.categoryTitle, { fontSize: scaleFont(22) }]}>
                {selectedcategorydata.name}
              </ThemedText>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.subcategoriesScroll}
            >
              {selectedcategorydata.subcategory.map(
                (sub: any, idx: any) => {
                  const isSelected = selectedSubcategory === sub;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.subcategoryButton,
                        {
                          backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                        },
                      ]}
                      onPress={() => handleSubcategorySelect(sub)}
                    >
                      <Text
                        style={[
                          styles.subcategoryButtonText,
                          {
                            color: isSelected ? "#fff" : theme.colors.text,
                            fontWeight: isSelected ? "bold" : "normal",
                            fontSize: scaleFont(14),
                          },
                        ]}
                      >
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </ScrollView>
            
            <ResponsiveGrid
              data={selectedcategorydata?.productId || []}
              paddingHorizontal={spacing.md}
              gap={spacing.md}
              phoneCols={2}
              tabletCols={3}
              largeTabletCols={4}
              renderItem={(product: any) => (
                <TouchableOpacity
                  style={[styles.productCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}
                  onPress={() => router.push(`/product/${product._id}`)}
                >
                  <Image source={{ uri: product.images[0] }} style={styles.productImage} resizeMode="cover" />
                  <ThemedView style={styles.productInfo} colorType="card">
                    <ThemedText type="default" colorType="textMuted" style={[styles.brandName, { fontSize: scaleFont(11) }]}>{product.brand}</ThemedText>
                    <ThemedText type="defaultSemiBold" numberOfLines={1} style={[styles.productName, { fontSize: scaleFont(13) }]}>{product.name}</ThemedText>
                    <View style={styles.priceRow}>
                      <ThemedText type="defaultSemiBold" style={[styles.price, { fontSize: scaleFont(14) }]}>₹{product.price}</ThemedText>
                      <ThemedText type="defaultSemiBold" style={{ color: theme.colors.primary, fontSize: scaleFont(13) }}>{product.discount}</ThemedText>
                    </View>
                  </ThemedView>
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        )}
      </ScrollView>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: "bold",
  },
  searchContainer: {
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  content: {
    flex: 1,
  },
  categoriesGrid: {
    flex: 1,
  },
  categoryCard: {
    width: "100%",
    borderRadius: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    overflow: "hidden",
  },
  categoryImage: {
    width: "100%",
    height: 150,
  },
  categoryInfo: {
    padding: 15,
  },
  categoryName: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  subcategories: {
    flexDirection: "row",
  },
  subcategoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  subcategoryText: {
    fontWeight: "500",
  },
  categoryDetail: {
    flex: 1,
  },
  categoryHeader: {
    marginBottom: 15,
  },
  backButton: {
    marginBottom: 10,
  },
  categoryTitle: {
    fontWeight: "bold",
    marginTop: 5,
  },
  subcategoriesScroll: {
    marginBottom: 15,
  },
  subcategoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  subcategoryButtonText: {},
  productCard: {
    width: "100%",
    borderRadius: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    aspectRatio: 1, // Strict aspect ratio prevents stretching
  },
  productInfo: {
    padding: 10,
  },
  brandName: {
    marginBottom: 2,
  },
  productName: {
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontWeight: "bold",
  },
});
