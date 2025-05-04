import os
import shutil

# 图片目录路径
img_dir = os.path.join(os.path.dirname(__file__), 'static', 'images', 'cultures')

# 检查图片是否存在
def check_and_fix_images():
    # 检查目录是否存在
    if not os.path.exists(img_dir):
        os.makedirs(img_dir)
        print(f"已创建图片目录: {img_dir}")

    # 太极拳图片修复 (ai_chi -> tai_chi)
    ai_chi_path = os.path.join(img_dir, 'ai_chi.jpg')
    tai_chi_path = os.path.join(img_dir, 'tai_chi.jpg')
    
    if os.path.exists(ai_chi_path) and not os.path.exists(tai_chi_path):
        try:
            shutil.copy2(ai_chi_path, tai_chi_path)
            print(f"已复制太极拳图片: {ai_chi_path} -> {tai_chi_path}")
        except Exception as e:
            print(f"复制太极拳图片时出错: {e}")
    
    # 检查所有需要的图片是否存在
    required_images = [
        'calligraphy.jpg', 'guqin.jpg', 'porcelain.jpg', 'tcm.jpg', 
        'confucianism.jpg', 'silk.jpg', 'peking_opera.jpg', 
        'paper_cutting.jpg', 'chinese_painting.jpg', 'tai_chi.jpg',
        'tea_culture.jpg', 'bronze_art.jpg'
    ]
    
    missing_images = []
    for img in required_images:
        img_path = os.path.join(img_dir, img)
        if not os.path.exists(img_path):
            missing_images.append(img)
    
    if missing_images:
        print("缺少以下图片文件:")
        for img in missing_images:
            print(f" - {img}")
    else:
        print("所有必需的图片文件都已存在")

if __name__ == "__main__":
    check_and_fix_images() 