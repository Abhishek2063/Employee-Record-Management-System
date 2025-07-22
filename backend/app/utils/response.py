def success_response(message: str, data: any = None, status_code: int = 200):
    return {
        "success": True,
        "status_code": status_code,
        "message": message,
        "data": data,
    }

def error_response(message: str, status_code: int = 400):
    return {
        "success": False,
        "status_code": status_code,
        "message": message,
        "data": None,
    }