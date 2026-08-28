FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY nuget.config .
COPY ["src/EduManage.Api/EduManage.Api.csproj", "src/EduManage.Api/"]
COPY ["src/EduManage.Application/EduManage.Application.csproj", "src/EduManage.Application/"]
COPY ["src/EduManage.Domain/EduManage.Domain.csproj", "src/EduManage.Domain/"]
COPY ["src/EduManage.Infrastructure/EduManage.Infrastructure.csproj", "src/EduManage.Infrastructure/"]
RUN dotnet restore "src/EduManage.Api/EduManage.Api.csproj"

COPY . .
RUN dotnet publish "src/EduManage.Api/EduManage.Api.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5090
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5090
ENTRYPOINT ["dotnet", "EduManage.Api.dll"]
