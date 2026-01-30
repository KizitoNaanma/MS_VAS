import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { HttpResponse, IHttpService } from 'src/common';

@Injectable()
export class AxiosService implements IHttpService {
  async get(
    url: string,
    config?: Record<string, any>,
  ): Promise<HttpResponse | undefined> {
    try {
      const response: AxiosResponse<HttpResponse> = await axios.get(
        url,
        config,
      );
      if (response?.data?.data) return Promise.resolve(response.data);
      if (response?.data?.responseBody)
        return Promise.resolve(response.data.responseBody);
      return Promise.resolve(response?.data);
    } catch (error) {
      if (error?.response?.data) return Promise.reject(error?.response?.data);
      return Promise.reject(error);
    }
  }

  async getWithHeaders(
    url: string,
    config?: Record<string, any>,
  ): Promise<HttpResponse | undefined> {
    const response: AxiosResponse<HttpResponse> = await axios.get(url, config);

    let data = response?.data;
    if (response?.data?.data) data = response.data;
    if (response?.data?.responseBody) data = response.data.responseBody;
    return Promise.resolve({ data, headers: response.headers });
  }

  async delete(
    url: string,
    config: Record<string, any>,
  ): Promise<HttpResponse | undefined> {
    try {
      const response: AxiosResponse<HttpResponse> = await axios.delete(
        url,
        config,
      );
      if (response?.data?.data) return Promise.resolve(response.data);
      if (response?.data?.responseBody)
        return Promise.resolve(response.data.responseBody);
      return Promise.resolve(response?.data);
    } catch (error) {
      if (error?.response?.data) return Promise.reject(error?.response?.data);
      return Promise.reject(error);
    }
  }

  async post(
    url: string,
    data: Record<string, any>,
    config?: Record<string, any>,
  ): Promise<HttpResponse | undefined> {
    try {
      const response: AxiosResponse<HttpResponse> = await axios.post(
        url,
        data,
        config,
      );

      if (response?.data?.data) return Promise.resolve(response.data);
      if (response?.data?.responseBody)
        return Promise.resolve(response.data.responseBody);
      return Promise.resolve({ data: response?.data });
    } catch (error) {
      if (error?.response?.data) return Promise.reject(error?.response?.data);
      return Promise.reject(error);
    }
  }

  async postWithHeaders(
    url: string,
    data: Record<string, any>,
    config?: Record<string, any>,
  ): Promise<HttpResponse | undefined> {
    const response: AxiosResponse<HttpResponse> = await axios.post(
      url,
      data,
      config,
    );

    if (response?.data?.data) data = response.data;
    if (response?.data?.responseBody) data = response.data.responseBody;
    return Promise.resolve({ data, headers: response.headers });
  }

  async patch(
    url: string,
    data: Record<string, any>,
    config: Record<string, any>,
  ): Promise<HttpResponse | undefined> {
    try {
      const response: AxiosResponse<HttpResponse> = await axios.patch(
        url,
        data,
        config,
      );
      if (response?.data?.data) return Promise.resolve(response.data);
      if (response?.data?.responseBody)
        return Promise.resolve(response.data.responseBody);
      return Promise.resolve(response?.data);
    } catch (error) {
      if (error?.response?.data) return Promise.reject(error?.response?.data);
      return Promise.reject(error);
    }
  }

  async put(
    url: string,
    data: Record<string, any>,
    config: Record<string, any>,
  ): Promise<HttpResponse | undefined> {
    try {
      const response: AxiosResponse<HttpResponse> = await axios.put(
        url,
        data,
        config,
      );
      if (response?.data?.data) return Promise.resolve(response.data);
      if (response?.data?.responseBody)
        return Promise.resolve(response.data.responseBody);
      return Promise.resolve(response?.data);
    } catch (error) {
      if (error?.response?.data) return Promise.reject(error?.response?.data);
      return Promise.reject(error);
    }
  }
}
