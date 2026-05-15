<?php

namespace Database\Seeders;

use App\Models\Stock;
use Illuminate\Database\Seeder;

class StockSeeder extends Seeder
{
    public function run(): void
    {
        $stocks = [
            ['symbol' => 'VNM', 'company_name' => 'Công ty Cổ phần Sữa Việt Nam', 'sector' => 'Thực phẩm & Đồ uống', 'exchange' => 'HOSE', 'current_price' => 71500, 'previous_close' => 70800, 'description' => 'Công ty sản xuất và kinh doanh sữa và các sản phẩm từ sữa hàng đầu Việt Nam.'],
            ['symbol' => 'FPT', 'company_name' => 'Công ty Cổ phần FPT', 'sector' => 'Công nghệ thông tin', 'exchange' => 'HOSE', 'current_price' => 121500, 'previous_close' => 119800, 'description' => 'Tập đoàn công nghệ hàng đầu Việt Nam, hoạt động trong lĩnh vực CNTT và viễn thông.'],
            ['symbol' => 'HPG', 'company_name' => 'Công ty Cổ phần Tập đoàn Hòa Phát', 'sector' => 'Vật liệu cơ bản', 'exchange' => 'HOSE', 'current_price' => 25650, 'previous_close' => 26100, 'description' => 'Tập đoàn sản xuất thép lớn nhất Việt Nam.'],
            ['symbol' => 'VCB', 'company_name' => 'Ngân hàng TMCP Ngoại thương Việt Nam', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 91200, 'previous_close' => 90500, 'description' => 'Ngân hàng thương mại lớn nhất Việt Nam tính theo vốn hóa thị trường.'],
            ['symbol' => 'ACB', 'company_name' => 'Ngân hàng TMCP Á Châu', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 24500, 'previous_close' => 24700, 'description' => 'Một trong những ngân hàng TMCP lớn nhất Việt Nam.'],
            ['symbol' => 'BID', 'company_name' => 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 48200, 'previous_close' => 47900, 'description' => 'Ngân hàng có mạng lưới chi nhánh rộng khắp cả nước.'],
            ['symbol' => 'CTG', 'company_name' => 'Ngân hàng TMCP Công thương Việt Nam', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 36800, 'previous_close' => 36500, 'description' => 'Ngân hàng thương mại nhà nước lớn, phục vụ doanh nghiệp và cá nhân.'],
            ['symbol' => 'GAS', 'company_name' => 'Tổng Công ty Khí Việt Nam', 'sector' => 'Dầu khí', 'exchange' => 'HOSE', 'current_price' => 78500, 'previous_close' => 79200, 'description' => 'Đơn vị vận chuyển và phân phối khí thiên nhiên lớn nhất Việt Nam.'],
            ['symbol' => 'HDB', 'company_name' => 'Ngân hàng TMCP Phát triển TP.HCM', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 26400, 'previous_close' => 26200, 'description' => 'Ngân hàng bán lẻ phát triển mạnh tại khu vực phía Nam.'],
            ['symbol' => 'MBB', 'company_name' => 'Ngân hàng TMCP Quân đội', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 22800, 'previous_close' => 22500, 'description' => 'Ngân hàng quân đội với dịch vụ tài chính đa dạng.'],
            ['symbol' => 'MWG', 'company_name' => 'Công ty CP Đầu tư Thế giới Di động', 'sector' => 'Bán lẻ', 'exchange' => 'HOSE', 'current_price' => 64200, 'previous_close' => 63500, 'description' => 'Chuỗi bán lẻ điện thoại và điện tử lớn nhất Việt Nam.'],
            ['symbol' => 'NVL', 'company_name' => 'Công ty CP Tập đoàn Đầu tư Địa ốc Nova', 'sector' => 'Bất động sản', 'exchange' => 'HOSE', 'current_price' => 18300, 'previous_close' => 18900, 'description' => 'Tập đoàn bất động sản tổng hợp tại Việt Nam.'],
            ['symbol' => 'PLX', 'company_name' => 'Tập đoàn Xăng dầu Việt Nam', 'sector' => 'Dầu khí', 'exchange' => 'HOSE', 'current_price' => 44500, 'previous_close' => 44100, 'description' => 'Đơn vị phân phối xăng dầu lớn nhất Việt Nam.'],
            ['symbol' => 'POW', 'company_name' => 'Tổng Công ty Điện lực Dầu khí Việt Nam', 'sector' => 'Tiện ích', 'exchange' => 'HOSE', 'current_price' => 12650, 'previous_close' => 12500, 'description' => 'Tổng công ty sản xuất điện thuộc PetroVietnam.'],
            ['symbol' => 'REE', 'company_name' => 'Công ty CP Cơ Điện Lạnh', 'sector' => 'Công nghiệp', 'exchange' => 'HOSE', 'current_price' => 68500, 'previous_close' => 67800, 'description' => 'Công ty hoạt động trong lĩnh vực cơ điện lạnh và điện lực.'],
            ['symbol' => 'SAB', 'company_name' => 'Tổng Công ty CP Bia - Rượu - Nước giải khát Sài Gòn', 'sector' => 'Thực phẩm & Đồ uống', 'exchange' => 'HOSE', 'current_price' => 56300, 'previous_close' => 56700, 'description' => 'Nhà sản xuất bia Sài Gòn nổi tiếng hàng đầu Việt Nam.'],
            ['symbol' => 'SSI', 'company_name' => 'Công ty CP Chứng khoán SSI', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 31200, 'previous_close' => 30900, 'description' => 'Công ty chứng khoán hàng đầu tại Việt Nam.'],
            ['symbol' => 'TCB', 'company_name' => 'Ngân hàng TMCP Kỹ thương Việt Nam', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 25700, 'previous_close' => 25400, 'description' => 'Ngân hàng tư nhân hàng đầu Việt Nam.'],
            ['symbol' => 'VHM', 'company_name' => 'Công ty CP Vinhomes', 'sector' => 'Bất động sản', 'exchange' => 'HOSE', 'current_price' => 42300, 'previous_close' => 41800, 'description' => 'Công ty bất động sản nhà ở lớn nhất Việt Nam thuộc Vingroup.'],
            ['symbol' => 'VIC', 'company_name' => 'Tập đoàn Vingroup', 'sector' => 'Bất động sản', 'exchange' => 'HOSE', 'current_price' => 41500, 'previous_close' => 41900, 'description' => 'Tập đoàn kinh tế tư nhân lớn nhất Việt Nam.'],
        ];

        foreach ($stocks as $stock) {
            Stock::create([
                ...$stock,
                'is_active' => true,
            ]);
        }
    }
}
