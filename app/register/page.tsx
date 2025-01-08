'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input";
import Loading from "@/components/loading";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { SnackbarContextType } from "@/contexts/SnackbarContext";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";

export default function Register() {
  const { showSnackbar } = useSnackbar() as SnackbarContextType;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    departmentName: "",
    lastName: "",
    firstName: "",
    email: "",
    phoneNumber: "",
    password: "",
    passwordConfirm: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.passwordConfirm) {
      showSnackbar("パスワードが一致しません", "error");
      return;
    }

    setLoading(true);

    try {
      // APIエンドポイントへのPOSTリクエスト実装
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSnackbar("登録が完了しました", "success");
        // 登録成功後の処理（例：ログインページへリダイレクト）
      } else {
        showSnackbar("登録に失敗しました", "error");
      }
    } catch (error) {
      showSnackbar("エラーが発生しました", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) return <Loading />;

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              会員登録
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  会社名 <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  name="companyName"
                  type="text"
                  placeholder="会社名"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  部署名 <span className="text-gray-400">(任意)</span>
                </label>
                <Input
                  name="departmentName"
                  type="text"
                  placeholder="部署名"
                  value={formData.departmentName}
                  onChange={handleChange}
                  className="placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    required
                    name="lastName"
                    type="text"
                    placeholder="姓"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="placeholder:text-gray-400"
                  />
                  <Input
                    required
                    name="firstName"
                    type="text"
                    placeholder="名"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  name="email"
                  type="email"
                  placeholder="メールアドレス"
                  value={formData.email}
                  onChange={handleChange}
                  className="placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  電話番号 <span className="text-gray-400">(任意)</span>
                </label>
                <Input
                  name="phoneNumber"
                  type="tel"
                  placeholder="電話番号"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  name="password"
                  type="password"
                  placeholder="パスワード"
                  value={formData.password}
                  onChange={handleChange}
                  className="placeholder:text-gray-400"
                  minLength={8}
                />
                <p className="text-sm text-gray-500">8文字以上で入力してください</p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  パスワード（確認） <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  name="passwordConfirm"
                  type="password"
                  placeholder="パスワード（確認）"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  className="placeholder:text-gray-400"
                  minLength={8}
                />
              </div>

              
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                登録する
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

